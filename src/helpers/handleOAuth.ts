import vscode from 'vscode';

export default async function handleOAuth(panel: vscode.WebviewPanel) {
  const client_id = process.env.GITHUB_CLIENT_ID as string;
  const client_secret = process.env.GITHUB_CLIENT_SECRET as string;
  const redirect_uri = process.env.REDIRECT_URI as string;

  try {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
    // parse the auth url and open it externally. after login, github will reroute to app (see: vscode.window.registerUriHandler line 233)
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
