import vscode from 'vscode';
import a11yTreeCommands from '../commands/A11yTreeCommands';
import { WebviewMessage } from '../types/webview.types';

export default async function parseTree(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  message: WebviewMessage
) {
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
