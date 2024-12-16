// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import * as net from 'net';
import cors from 'cors';

//import from other files.
import a11yTreeCommands from './commands/A11yTreeCommands';
import dbConnect from './server/dbConnect';
import userRoute from './server/routes/userRoute';
import projectRoute from './server/routes/projectRoute';
import pageRoute from './server/routes/pageRoute';
import oAuthController from './server/controllers/oAuthController';
import sessionController from './server/controllers/sessionController';
import dotenv from 'dotenv';
dotenv.config();

export async function activate(context: vscode.ExtensionContext) {
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

  //oauth login endpoint
  app.get(
    '/auth/callback',
    oAuthController.getTemporaryCode,
    oAuthController.requestToken,
    oAuthController.getUserData,
    oAuthController.saveUser,
    sessionController.startSession,
    async (req, res) => {
      await context.secrets.store('ssid', res.locals.user._id);
      res.status(200).json(res.locals.user);
    }
  );

  //database interaction endpoints
  app.use('/users', userRoute);
  app.use('/projects', projectRoute);
  app.use('/pages', pageRoute);

  // Default endpoint
  app.get('/', (req, res) => {
    res.send('Welcome to the A11y Root Extension Server!!!');
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

  //to bind to all available network interfaces (0.0.0.0) instead of localhost.
  // const server = app.listen(PORT, '0.0.0.0', async () => {
  //   console.log(`Server is accessible at http://localhost:${PORT}`);
  // });

  // const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : ;

  // might need to change 127.0.0.1 to localhost?

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
    vscode.window.registerUriHandler({
      async handleUri(uri: vscode.Uri) {
        if (uri.path === '/auth/callback') {
          const query = new URLSearchParams(uri.query);
          //temporary code from github that is needed to continue oauth
          const code = query.get('code');
          vscode.window.showInformationMessage(`Received callback`);
          try {
            const response = await fetch(
              `http://localhost:3333/auth/callback?code=${code}`,
              {
                method: 'GET',
              }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Parse the JSON response
            const user = JSON.stringify(data);
            vscode.window.showInformationMessage(
              `oauth response.data -> ${user}`
            );
            panel.webview.postMessage({
              command: 'loggedIn',
              //pass entire user instead of username
              message: data,
            });
          } catch (error: any) {
            vscode.window.showInformationMessage(`Error : -> ${error.message}`);
          }
        }
      },
    });

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
      if (message.command === 'beginOAuth') {
        const client_id = process.env.GITHUB_CLIENT_ID as string;
        const client_secret = process.env.GITHUB_CLIENT_SECRET as string;
        const redirect_uri = process.env.REDIRECT_URI as string;
        try {
          const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
          //parse the auth url and open it externally. after login, github will reroute to app (see: vscode.window.registerUriHandler line 233)
          vscode.env.openExternal(vscode.Uri.parse(authUrl));
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || 'Unknown error';
          //passes error to front end in the form of command/message - not sure when this would actually trigger?
          panel.webview.postMessage({
            command: 'error',
            message: `Failed to start Oauth: ${errorMessage}`,
          });
        }
      }

      if (message.command === 'beginLogout') {
        try {
          await context.secrets.delete('ssid');
          panel.webview.postMessage({
            command: 'loggedOut',
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || 'Unknown error';
          //passes error to front end in the form of command/message - not sure when this would actually trigger?
          panel.webview.postMessage({
            command: 'error',
            message: `Failed to logout: ${errorMessage}`,
          });
        }
      }

      if (message.command === 'checkLogin') {
        try {
          const userId = await context.secrets.get('ssid');
          if (userId) {
            const response = await fetch(
              `http://localhost:3333/users/${userId}`,
              {
                method: 'GET',
              }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Parse the JSON response

            panel.webview.postMessage({
              command: 'loggedIn',
              //pass entire user instead of username
              message: data,
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || 'Unknown error';
          //passes error to front end in the form of command/message - not sure when this would actually trigger?
          panel.webview.postMessage({
            command: 'error',
            message: `Failed to logout: ${errorMessage}`,
          });
        }
      }

      if (message.command === 'parseTree') {
        if (message.url) {
          await a11yTreeCommands.handleFetchTree(
            panel,
            context,
            message.url,
            message.user
          );
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
