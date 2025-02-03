// See docs/DEV-README.md for FILE-SPECIFIC NOTES
import * as vscode from 'vscode'; // contains VS Code extensibility API
import * as fs from 'fs';
import * as path from 'path';
import registerUriHandler from './helpers/registerUriHandler';
import initializeWebview from './helpers/initializeWebview';
import handleOAuth from './helpers/handleOAuth';
import handleLogout from './helpers/handleLogout';
import checkLoginStatus from './helpers/checkLoginStatus';
import parseTree from './helpers/parseTree';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let globalContext: vscode.ExtensionContext;
let uriHandlerRegistered = false;
let panelInstances: Map<string, vscode.WebviewPanel> = new Map();

export async function activate(context: vscode.ExtensionContext) {
  globalContext = context; // Save the context globally

  context.subscriptions.push(openTab(context));
}

function openTab(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('a11y-root-extension.openTab', () => {
    const panelId = `panel-${Date.now()}`;
    const panel = vscode.window.createWebviewPanel(
      'a11yRootTab',
      'A11y Root',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        enableForms: true,
      }
    );
    panelInstances.set(panelId, panel);
    panel.onDidDispose(() => {
      console.log(`Webview ${panelId} disposed.`);
      panelInstances.delete(panelId); // Remove from the map
    });

    if (!uriHandlerRegistered) {
      registerUriHandler(panel, context);
      uriHandlerRegistered = true;
    }

    initializeWebview(panel, context);

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
      //start oauth process if message command is beginOAuth
      if (message.command === 'beginOAuth') {
        await handleOAuth(panel);
      }
      //delete ssid from vscode secrets if message command is beginLogout, this will end the session
      if (message.command === 'beginLogout') {
        await handleLogout(panel, context);
      }
      //check if user is logged in if message command is checkLogin
      if (message.command === 'checkLogin') {
        await checkLoginStatus(panel, context);
      }

      if (message.command === 'parseTree') {
        await parseTree(panel, context, message);
      }
    });
  });
}

export async function deactivate() {
  if (globalContext) {
    globalContext.subscriptions.forEach((subscription) =>
      subscription.dispose()
    );
  }
  panelInstances.forEach((panel) => panel.dispose());
  panelInstances.clear();
}
