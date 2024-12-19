// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createServer } from './server/server';
import a11yTreeCommands from './commands/A11yTreeCommands';
import dotenv from 'dotenv';
dotenv.config();

let globalContext: vscode.ExtensionContext;
let uriHandlerRegistered = false;
let serverManager: {
  startServer: () => Promise<void>;
  getPort: () => number | null;
  stopServer: () => void;
};

export async function activate(context: vscode.ExtensionContext) {
  globalContext = context; // Save the context globally
  const initialPort = 5050;
  //const PORT = 3333; !!!!!!!! play around with port initializing, may need to set localhost instead of
  // server = app.listen(serverPort, '127.0.0.1', () => {
  //   console.log(`Server running at http://localhost:${serverPort}`);
  // });
  let port: number | null = null;

  serverManager = createServer(initialPort, context);

  try {
    await serverManager.startServer();
    port = serverManager.getPort();
    vscode.window.showInformationMessage(
      `Server started on port ${initialPort}`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to start server: ${error.message}`);
  }

  // Add subscriptions
  context.subscriptions.push({
    dispose: () => {
      serverManager.stopServer();
      console.log('Server stopped.');
    },
  });

  if (!port) {
    vscode.window.showErrorMessage(`Failed to start server: ${port}`);
    return;
  }

  // Add other extension functionality
  context.subscriptions.push(openTab(context, port));
}

function openTab(context: vscode.ExtensionContext, port: number) {
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
    if (!uriHandlerRegistered) {
      vscode.window.registerUriHandler({
        async handleUri(uri: vscode.Uri) {
          if (uri.path === '/auth/callback') {
            const query = new URLSearchParams(uri.query);
            //temporary code from github that is needed to continue oauth
            const code = query.get('code');
            vscode.window.showInformationMessage(`Received callback`);
            try {
              const response = await fetch(
                `http://localhost:${port}/auth/callback?code=${code}`,
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
              vscode.window.showInformationMessage(
                `Error : -> ${error.message}`
              );
            }
          }
        },
      });
      uriHandlerRegistered = true;
    }

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
              `http://localhost:${port}/users/${userId}`,
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
          } else {
            panel.webview.postMessage({ command: 'loggedOut' });
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
  if (globalContext) {
    globalContext.subscriptions.forEach((subscription) =>
      subscription.dispose()
    );
  }
}
