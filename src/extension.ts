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
      origin: ['http://localhost:3333'], // Allow specific origins
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

  // Possible fixes / problems

  // app.use(
  //   cors({
  //     origin: '*', // Allow all origins; restrict to specific origins for better security.
  //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   })
  // );

  // app.listen(PORT, HOST, () => {
  //   console.log(`Server is running on ${HOST}:${PORT}`);
  // });

  //to bind to all available network interfaces (0.0.0.0) instead of localhost.
  // const server = app.listen(PORT, '0.0.0.0', async () => {
  //   console.log(`Server is accessible at http://localhost:${PORT}`);
  // });

  // const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : ;

  // misght need to change 127.0.0.1 to localhost?

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
      'dist',
      'webview',
      'index.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Replace placeholders with compiled resource URIs
    const bundleJsUri = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, 'dist', 'webview', 'bundle.js')
      )
    );
    // const styleCssUri = panel.webview.asWebviewUri(
    //   vscode.Uri.file(
    //     path.join(context.extensionPath, 'src', 'webview', 'style.css')
    //   )
    // );

    htmlContent = htmlContent.replace('bundle.js', bundleJsUri.toString());
    // .replace('{{style.css}}', styleCssUri.toString());

    panel.webview.html = htmlContent;
    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
      //will change this to connect login button to github
      if (message.command === 'checkHealth') {
        try {
          // Make a request to the server health endpoint
          // const serverBaseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3000';
          // eventually move to using .env.SERVER_BASE_URL or handle when we move to https
          const response = await axios.get(`http://localhost:3333/health`);

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

// function getWebviewContent(scriptUri: vscode.Uri): string {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>A11y Root</title>
//     </head>
//     <body>
//       <div id="root"></div>
//       <script src="${scriptUri}"></script>
//     </body>
//     </html>
//   `;
// }
