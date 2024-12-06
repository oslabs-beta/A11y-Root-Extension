// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import * as net from 'net';
import axios from 'axios';
import cors from 'cors';

//import from other files
import a11yTreeCommands from './commands/A11yTreeCommands';
import dbConnect from './server/dbConnect';
import userRoute from './server/routes/userRoute';
import projectRoute from './server/routes/projectRoute';
import pageRoute from './server/routes/pageRoute';
import dotenv from 'dotenv';
dotenv.config();

export async function activate(context: vscode.ExtensionContext) {
  // Load environment variables in development

  // Check if in development mode
  // const isDevelopment = process.env.NODE_ENV === 'development';

  // if (isDevelopment) {
  //   // Retrieve secrets from .env
  //   const MONGO_URI = process.env.MONGO_URI;

  //   if (MONGO_URI) {
  //     // Store the secret in Secret Storage
  //     await vscode.secretStorage.store('MONGO_URI', MONGO_URI);
  //     console.log(
  //       'MONGO_URI has been loaded from .env and stored in Secret Storage.'
  //     );
  //   } else {
  //     console.warn('.env file is missing the MONGO_URI key.');
  //   }
  // }

  // // Example of retrieving the stored secret
  // const storedURI = await vscode.secretStorage.get('MONGO_URI');
  // if (storedURI) {
  //   console.log(`Retrieved MONGO_URI from Secret Storage: ${storedURI}`);
  // } else {
  //   vscode.window.showWarningMessage(
  //     'MongoDB URI is not configured. Please set it in Secret Storage or .env.'
  //   );
  // }

  const PORT = 3333;
  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:3333', 'https://my-frontend-domain.com'], // Allow specific origins
      methods: ['GET', 'POST'], // Restrict to specific HTTP methods
      credentials: true, // Allow cookies or authentication headers
    })
  );

  // Middleware to log requests
  app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
  });

  //PARSING MIDDLEWARE
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('What up!');
  });

  //database interaction endpoints
  app.use('/users', userRoute);
  app.use('/projects', projectRoute);
  app.use('/pages', pageRoute);

  // Default endpoint

  app.get('/', (req, res) => {
    res.send('Welcome to the A11y Root Extension Server!');
  });

  // Check if the port is available
  const isPortAvailable = async (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const tester = net
        .createServer()
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });
  };

  if (!(await isPortAvailable(PORT))) {
    vscode.window.showErrorMessage(`Port ${PORT} is already in use.`);
    return;
  }
  //Allow External Connections: Update your app.listen in extension.ts to bind to all available network interfaces (0.0.0.0) instead of localhost.
  // const server = app.listen(PORT, '0.0.0.0', async () => {
  //   console.log(`Server is accessible at http://localhost:${PORT}`);
  // });

  // import cors from 'cors';

  // app.use(
  //   cors({
  //     origin: '*', // Allow all origins; restrict to specific origins for better security.
  //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   })
  // );

  // const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : ;

  // app.listen(PORT, HOST, () => {
  //   console.log(`Server is running on ${HOST}:${PORT}`);
  // });

  // Start the server
  const server = app.listen(PORT, '127.0.0.1', async () => {
    const externalUri = await vscode.env.asExternalUri(
      vscode.Uri.parse(`http://localhost:${PORT}`)
    );
    console.log(`Server available at ${externalUri}`);
    vscode.window.showInformationMessage(`Server started at ${externalUri}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server encountered an error:', error);
    vscode.window.showErrorMessage(`Server failed to start: ${error.message}`);
  });

  //once server is running, connect it to the database
  dbConnect();

  // Cleanup server on extension deactivate
  context.subscriptions.push({
    dispose: () => {
      server.close(() => {
        console.log('Server stopped.');
        vscode.window.showInformationMessage('Server stopped.');
      });
    },
  });

  // Add other extension functionality
  context.subscriptions.push(openTab(context));
}

function openTab(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('a11y-root-extension.openTab', () => {
    const panel = vscode.window.createWebviewPanel(
      'a11yRootTab',
      'A11y Root',
      vscode.ViewColumn.One,
      {
        enableScripts: true, // Allow scripts in the webview
        retainContextWhenHidden: true, // If true, the webview preserves its state when hidden.
        // Useful for panels that should retain their content and state when switching tabs.
        enableForms: true, // not sure if we need this
      }
    );

    const htmlPath = path.join(
      context.extensionPath,
      'src',
      'webview',
      'index.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Replace placeholders with compiled resource URIs
    const mainJsUri = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, 'webview-dist', 'main.js')
      )
    );
    const styleCssUri = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, 'src', 'webview', 'style.css')
      )
    );

    htmlContent = htmlContent
      .replace('{{main.js}}', mainJsUri.toString())
      .replace('{{style.css}}', styleCssUri.toString());

    panel.webview.html = htmlContent;
    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
      //will change this to connect login button to github
      if (message.command === 'checkHealth') {
        try {
          // Make a request to the server health endpoint
          // const serverBaseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3000';
          // eventually move to using .env.SERVER_BASE_URL or handle when we move to https
          const response = await axios.get(`http://localhost:3000/health`);

          if (response.status === 200) {
            panel.webview.postMessage({
              command: 'healthCheckResult',
              message: `Server responded: ${response.data}`, // Expect "OK"
            });
          } else {
            panel.webview.postMessage({
              command: 'healthCheckResult',
              message: `Server error: ${response.status}`,
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || 'Unknown error';
          panel.webview.postMessage({
            command: 'healthCheckError',
            message: `Failed to connect to server: ${errorMessage}`,
          });
        }
      }
      if (message.command === 'fetchTree') {
        if (message.url) {
          await a11yTreeCommands.handleFetchTree(panel, context, message.url);
        } else {
          panel.webview.postMessage({
            command: 'error',
            message: 'No URL provided for fetchTree command.',
          });
        }
      }
    });
  });
}

// This method is called when your extension is deactivated
export async function deactivate() {
  // const isDevelopment = process.env.NODE_ENV === 'development';
  // if (isDevelopment) {
  //   await vscode.secretStorage.delete('MONGO_URI');
  //   console.log('Development secret MONGO_URI has been cleared from Secret Storage.');
  // }
}

//import axios from 'axios';
//import { spawn, execSync } from 'child_process'; // spawn runs the server in a detached child process to avoid blocking the extension's (parent process); execSync checks if server is running

//let serverProcess: any; // represents the child process running the server

// The -k flag tells curl to ignore SSL certificate verification. This is necessary when using self-signed certificates for local development.
// changes http to https
//maybe try axios because it is a safer http request
// const isServerActive = () => {
//   try {
//     execSync('curl http://localhost:3000'); // execSync utilizes the CLI command to check if client URL is running
//     return true;
//   } catch {
//     return false;
//   }
// };

// const isServerActive = async () => {
//   try {
//     const response = await axios.get('http://localhost:3000');
//     return response.status === 200;
//   } catch (error: any) {
//     console.error('Server check failed:', error.message);
//     return false;
//   }
// };

// setTimeout(() => {
//   if (isServerActive()) {
//     vscode.window.showInformationMessage('Server Successfully Launched!');
//   } else {
//     vscode.window.showErrorMessage('Server failed to start.');
//   }
// }, 3000);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// export async function activate(context: vscode.ExtensionContext) {
//   const app = express();
//   const PORT = 3000;

//   app.get('/', (req, res) => {
//     res.send('Welcome to the A11y Root Extension Server!');
//   });

//   app.get('/health', (req, res) => {
//     res.status(200).send('OK');
//   });

//   const server = app.listen(PORT, 'localhost', async () => {
//     const externalUri = await vscode.env.asExternalUri(
//       vscode.Uri.parse(`http://localhost:${PORT}`)
//     );
//     console.log(`Server available at ${externalUri}`);
//   });

//   // Register cleanup on deactivate
//   context.subscriptions.push({
//     dispose: () => {
//       server.close(() => {
//         console.log('Server stopped.');
//       });
//     },
//   });

//   context.subscriptions.push(openTab(context));
// }

///A11y-Root-Extension/src/server.js
// const serverScript = context.asAbsolutePath('src/server.js'); // launches server when extension activates

// console.log('Resolved server script path:', serverScript);

// if (!isServerActive()) {
//   try {
//     serverProcess = spawn('node', [serverScript], {
//       cwd: context.extensionPath,
//       detached: true,
//       stdio: 'ignore',
//     });
//     serverProcess.unref();
//     vscode.window.showInformationMessage('Server Successfully Launched!!!!');
//     // setTimeout(() => {
//     //   if (isServerActive()) {
//     //     vscode.window.showInformationMessage('Server Successfully Launched!');
//     //   } else {
//     //     vscode.window.showErrorMessage('Server failed to start.');
//     //   }
//     // }, 3000);
//   } catch (error) {
//     vscode.window.showInformationMessage(`Error starting server`);
//   }
//   // serverProcess.unref();
//   // vscode.window.showInformationMessage('Server Successfully Launched!!!!');
// }

// if (isServerActive()) {
//   vscode.window.showInformationMessage('Server still running');
// } else {
//   vscode.window.showInformationMessage('Server no work');
// }

// // detaches the server process from parent (the extension) so it won't block the extension's lifecycle

// // Use the console to output diagnostic information (console.log) and errors (console.error)
// // This line of code will only be executed once when your extension is activated
// console.log(
//   'Congratulations, your extension "a11y-root-extension" is now active!'
// );

// vscode.window.showInformationMessage('A11y Root Extension Activated!');

// // Clean up when extension is deactivated
// context.subscriptions.push({
//   dispose: () => {
//     serverProcess ? process.kill(-serverProcess.pid) : (serverProcess = null);
//   },
// });

// The command has been defined in the package.json file
// Now provide the implementation of the command with registerCommand
// The commandId parameter must match the command field in package.json

// BOILERPLATE COMMAND
// demonstrates how you can send info messages to users via vscode.window.showInformationMessage
// const disposable = vscode.commands.registerCommand('a11y-root-extension.helloWorld', () => {
// 	// The code you place here will be executed every time your command is executed
// 	// Display a message box to the user
// 	vscode.window.showInformationMessage('Hello World from A11y-Root-Extension!');
// });

//context.subscriptions.push(disposable);

//context is an instance of vscode.ExtensionContext that is passed to the activate function of a VS Code extension.
//subscriptions is a property of context. It is an array that holds disposables.
//A disposable is any object that implements the dispose() method.
//Disposables are used to clean up resources(e.g., listeners, commands, panels) when the extension is deactivated or a resource is no longer needed.

// subscribe actions to context.subscriptions

// DEFINE TAB

//  Parameters of createWebviewPanel
// View Type ('simpleTab')
// A unique identifier for the webview panel.
// Used internally to distinguish this panel from others.
// Example: 'simpleTab'.

// Column (vscode.ViewColumn.One)
// Specifies which editor column the webview panel will appear in.
// Options:
// vscode.ViewColumn.One: Opens the webview in the first editor column.
// vscode.ViewColumn.Two: Opens the webview in the second editor column.
// vscode.ViewColumn.Active: Opens the webview in the currently active column.
// Example: vscode.ViewColumn.One opens it in the first column.

// Options (Configuration Object)
// An object that configures the behavior and features of the webview panel.

// enableScripts: true

// Allows the webview to run JavaScript.
// Default: false (disabled for security reasons).
// Example: enableScripts: true allows you to inject and execute scripts in the HTML displayed by the webview.
// Additional options (not used here but available):

// retainContextWhenHidden:
// If true, the webview preserves its state when hidden.
// Useful for panels that should retain their content and state when switching tabs.
// enableForms:
// Allows the webview to use forms.
// Default: true.

// The Return Value
// The function returns an instance of WebviewPanel, assigned to panel. You can use this object to manage the webview.
