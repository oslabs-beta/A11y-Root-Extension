// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import * as net from 'net';
import axios from 'axios';
import a11yTreeCommands from './commands/A11yTreeCommands';

export async function activate(context: vscode.ExtensionContext) {
  const PORT = 3333;
  const app = express();

  // Middleware to log requests
  app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
  });

  app.get('/', (req, res) => {
    res.send('Welcome to the A11y Root Extension Server!');
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('What up!');
  });

  // Default endpoint

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

  // Start the server
  const server = app.listen(PORT, 'localhost', async () => {
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
      if (message.command === 'checkHealth') {
        try {
          // Make a request to the server health endpoint
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
        // const { url } = message;

        // try {
        //   vscode.window.showInformationMessage(
        //     `Fetching accessibility data for: ${url}`
        //   );

        //   // Step 1: Launch Puppeteer and open the page
        //   const browser = await puppeteer.launch();
        //   const page = await browser.newPage();
        //   await page.goto(url);

        //   // Step 2: Generate Puppeteer accessibility tree snapshot
        //   const a11yTree = await page.accessibility.snapshot();
        //   await browser.close();

        //   // Step 3: Save results
        //   const outputFolder = path.join(context.extensionPath, 'results');
        //   fs.mkdirSync(outputFolder, { recursive: true });

        //   const treeResultPath = path.join(outputFolder, 'a11y-tree.json');

        //   fs.writeFileSync(treeResultPath, JSON.stringify(a11yTree, null, 2));

        //   // Step 6: Send results back to the webview
        //   panel.webview.postMessage({
        //     command: 'result',
        //     message: `Results saved to:\n- ${treeResultPath}`,
        //   });

        //   vscode.window.showInformationMessage(
        //     `Accessibility results saved: ${treeResultPath}`
        //   );
        // } catch (error: unknown) {
        //   const errorMessage =
        //     error instanceof Error ? error.message : 'Unknown error occurred.';
        //   vscode.window.showErrorMessage(
        //     `Failed to fetch accessibility data: ${errorMessage}`
        //   );
        //   panel.webview.postMessage({
        //     command: 'error',
        //     message: `Failed to fetch accessibility data: ${errorMessage}`,
        //   });
        //}
      }
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {
  // if (serverProcess) {
  //   process.kill(-serverProcess.pid);
  //   serverProcess = null;
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
