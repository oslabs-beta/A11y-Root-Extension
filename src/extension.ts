// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
//import { createServer } from './server/server';
import a11yTreeCommands from './commands/A11yTreeCommands';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let globalContext: vscode.ExtensionContext;
let uriHandlerRegistered = false;
let panelInstances: Map<string, vscode.WebviewPanel> = new Map();

export async function activate(context: vscode.ExtensionContext) {
  globalContext = context; // Save the context globally

  // Add other extension functionality
  context.subscriptions.push(openTab(context, 3000));
}

function openTab(context: vscode.ExtensionContext, port: number) {
  return vscode.commands.registerCommand('a11y-root-extension.openTab', () => {
    const panelId = `panel-${Date.now()}`;
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
    panelInstances.set(panelId, panel);
    panel.onDidDispose(() => {
      console.log(`Webview ${panelId} disposed.`);
      panelInstances.delete(panelId); // Remove from the map
    });

    if (!uriHandlerRegistered) {
      vscode.window.registerUriHandler({
        async handleUri(uri: vscode.Uri) {
          if (uri.path === '/auth/callback') {
            const query = new URLSearchParams(uri.query);
            //temporary code from github that is needed to continue oauth
            const code = query.get('code');
            vscode.window.showInformationMessage(`Received callback - ${code}`);
            try {
              const response = await fetch(
                `https://a11y-root-webpage.onrender.com/extension/callback?code=${code}`,
                {
                  method: 'GET',
                }
              );
              if (!response.ok) {
                const errorText = await response.text(); // Fetch error details
                throw new Error(
                  `HTTP error! status: ${response.status}, message: ${errorText}`
                );
              }

              const data = await response.json(); // Parse the JSON response
              const user = JSON.stringify(data);
              await context.secrets.store('ssid', data._id);

              panel.webview.postMessage({
                command: 'loggedIn',
                //pass entire user instead of username
                message: data,
              });
            } catch (error: any) {
              vscode.window.showInformationMessage(`Error : ${error.message}`);
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
          panel.webview.postMessage({
            command: 'loggedOut',
          });
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
              `https://a11y-root-webpage.onrender.com/users/${userId}`,
              {
                method: 'GET',
              }
            );
            if (!response.ok) {
              panel.webview.postMessage({ command: 'loggedOut' });
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
            port,
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
// It does not seem to be working properly when user logs out, closes tab and reopens tab
export async function deactivate() {
  if (globalContext) {
    globalContext.subscriptions.forEach((subscription) =>
      subscription.dispose()
    );
  }
  panelInstances.forEach((panel) => panel.dispose());
  panelInstances.clear();
}
