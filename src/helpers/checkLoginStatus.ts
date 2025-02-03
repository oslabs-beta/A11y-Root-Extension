import vscode from 'vscode';

export default async function checkLoginStatus(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
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
