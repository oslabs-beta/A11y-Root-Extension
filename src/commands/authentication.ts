import * as vscode from 'vscode';
import * as http from 'http';
import express from 'express';

export async function githubOauth(
  context: vscode.ExtensionContext
): Promise<void> {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const redirect_uri = process.env.REDIRECT_URI;
  try {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
    //parse the auth url and open it
    vscode.env.openExternal(vscode.Uri.parse(authUrl));
    const code = ''; // get this from startServer function
    const token = ''; //get this from getToken function
    //store token in vscode storage after
  } catch (error: any) {
    vscode.window.showErrorMessage(`GitHub OAuth failed: ${error.message}`);
  }
  async function startServer(redirect_uri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const app = express();
      const server = app.listen(3333, () => {
        console.log(`OAuth server listening on ${redirect_uri}`);
      });
      app.get('/auth/callback', (req, res) => {
        const code = req.query.code;
        if (code) {
          res.status(201).send('Authorization was successful!');
          server.close();
          resolve(code);
        }
        res.status(400).send('Authorization failed');
        server.close();
      });
    });
  }
}
