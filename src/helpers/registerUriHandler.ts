import * as vscode from 'vscode';

export default function registerUriHandler(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path === '/auth/callback') {
        const query = new URLSearchParams(uri.query);
        const code = query.get('code');
        try {
          const response = await fetch(
            `https://a11yroot.dev/extension/callback?code=${code}`,
            {
              method: 'GET',
            }
          );
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorText}`
            );
          }

          const data = await response.json();
          // user does not seem to be used?
          const user = JSON.stringify(data);
          await context.secrets.store('ssid', data._id);

          panel.webview.postMessage({
            command: 'loggedIn',
            message: data,
          });
        } catch (error: any) {
          vscode.window.showInformationMessage(`Error : ${error.message}`);
        }
      }
    },
  });
}
