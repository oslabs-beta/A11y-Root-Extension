import vscode from 'vscode';

export default async function handleLogout(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
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
