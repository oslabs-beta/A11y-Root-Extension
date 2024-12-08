// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import * as net from 'net';
import axios from 'axios';
import cors from 'cors';

//import from other files.
import a11yTreeCommands from './commands/A11yTreeCommands';
import dbConnect from './server/dbConnect';
import userRoute from './server/routes/userRoute';
import projectRoute from './server/routes/projectRoute';
import pageRoute from './server/routes/pageRoute';
import oAuthController from './server/controllers/oAuthController';
import cookieController from './server/controllers/cookieController';
import sessionController from './server/controllers/sessionController';
import dotenv from 'dotenv';
dotenv.config();

export async function activate(context: vscode.ExtensionContext) {
  // vscode://a11y-root.a11y-root-extension/auth/callback
  // vscode.window.registerUriHandler({
  //   async handleUri(uri: vscode.Uri) {
  //     if (uri.path === '/auth/callback') {
  //       const query = new URLSearchParams(uri.query);
  //       const code = query.get('code');
  //       vscode.window.showInformationMessage(`Received callback`);
  //       try {
  //         const response = await axios.get(
  //           `http://localhost:3333/auth/callback?code=${code}`
  //         );
  //         // ,{code}

  //         if (response.status === 200) {
  //           vscode.window.showInformationMessage(
  //             `200 : Successfully sent to server! -> ${JSON.stringify(
  //               response.data
  //             )}`
  //           );
  //           vscode.webview.postMessage({
  //             command: 'loggedIn',
  //             username: response.data,
  //           });
  //         }
  //       } catch (error: any) {
  //         vscode.window.showInformationMessage(`Error : -> ${error.message}`);
  //       }
  //     }
  //   },
  // });
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
  // app.get('/auth/callback', (req, res) => {
  //   vscode.window.showInformationMessage(`callback baby!`);
  //   res.status(200).send('What up!');
  // });

  // app.get('/auth');
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
      const secret = await context.secrets.get('ssid');
      res.status(200).json(res.locals.githubUser);
      // res.status(200).json(res.locals.token);
      // res.status(200).send('Authorization successful');
      // server.close();
      // resolve(res.locals.token as string);
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
    vscode.window.registerUriHandler({
      async handleUri(uri: vscode.Uri) {
        if (uri.path === '/auth/callback') {
          const query = new URLSearchParams(uri.query);
          const code = query.get('code');
          vscode.window.showInformationMessage(`Received callback`);
          try {
            const response = await axios.get(
              `http://localhost:3333/auth/callback?code=${code}`
            );
            // ,{code}

            if (response.status === 200) {
              vscode.window.showInformationMessage(
                `200 : Successfully sent to server! -> ${JSON.stringify(
                  response.data
                )}`
              );
              panel.webview.postMessage({
                command: 'loggedIn',
                username: response.data.login,
              });
            }
          } catch (error: any) {
            vscode.window.showInformationMessage(`Error : -> ${error.message}`);
          }
        }
      },
    });

    // git hub data response
    // const data = {
    //   login: 'ianbuchanan42',
    //   id: 107963806,
    //   node_id: 'U_kgDOBm9lng',
    //   avatar_url: 'https://avatars.githubusercontent.com/u/107963806?v=4',
    //   gravatar_id: '',
    //   url: 'https://api.github.com/users/ianbuchanan42',
    //   html_url: 'https://github.com/ianbuchanan42',
    //   followers_url: 'https://api.github.com/users/ianbuchanan42/followers',
    //   following_url:
    //     'https://api.github.com/users/ianbuchanan42/following{/other_user}',
    //   gists_url: 'https://api.github.com/users/ianbuchanan42/gists{/gist_id}',
    //   starred_url:
    //     'https://api.github.com/users/ianbuchanan42/starred{/owner}{/repo}',
    //   subscriptions_url:
    //     'https://api.github.com/users/ianbuchanan42/subscriptions',
    //   organizations_url: 'https://api.github.com/users/ianbuchanan42/orgs',
    //   repos_url: 'https://api.github.com/users/ianbuchanan42/repos',
    //   events_url: 'https://api.github.com/users/ianbuchanan42/events{/privacy}',
    //   received_events_url:
    //     'https://api.github.com/users/ianbuchanan42/received_events',
    //   type: 'User',
    //   user_view_type: 'public',
    //   site_admin: false,
    //   name: null,
    //   company: null,
    //   blog: '',
    //   location: null,
    //   email: null,
    //   hireable: null,
    //   bio: null,
    //   twitter_username: null,
    //   notification_email: null,
    //   public_repos: 6,
    //   public_gists: 0,
    //   followers: 0,
    //   following: 10,
    //   created_at: '2022-06-21T23:36:16Z',
    //   updated_at: '2024-11-29T19:59:24Z',
    // };

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
      if (message.command === 'auth') {
        vscode.window.showInformationMessage(`auth!!!!!`);
        const response = await axios.get(`http://localhost:3333/auth/callback`);
      }

      if (message.command === 'beginOAuth') {
        const client_id = process.env.GITHUB_CLIENT_ID as string;
        const client_secret = process.env.GITHUB_CLIENT_SECRET as string;
        const redirect_uri = process.env.REDIRECT_URI as string;
        try {
          const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
          //parse the auth url and open it
          vscode.env.openExternal(vscode.Uri.parse(authUrl));
          const response = await axios.get('http://localhost:3333/auth');
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || 'Unknown error';
          panel.webview.postMessage({
            command: 'beginOauthError',
            message: `Failed to start Oauth: ${errorMessage}`,
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
