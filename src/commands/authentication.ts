import * as vscode from 'vscode';
import * as http from 'http';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import oAuthController from '../server/controllers/oAuthController';
import cookieController from '../server/controllers/cookieController';
import sessionController from '../server/controllers/sessionController';

export async function githubOauth(
  context: vscode.ExtensionContext
): Promise<void> {
  const client_id = process.env.GITHUB_CLIENT_ID as string;
  const client_secret = process.env.GITHUB_CLIENT_SECRET as string;
  const redirect_uri = process.env.REDIRECT_URI as string;
  try {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
    //parse the auth url and open it
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    const token = await startServer(redirect_uri);
    await context.globalState.update('githubToken', token);

    // const code = await startServer(redirect_uri);
    // const token = await getGithubToken(code, client_id, client_secret);
    // const userData = '';

    //get user data using the token
    //store token in vscode storage after
  } catch (error: any) {
    vscode.window.showErrorMessage(`GitHub OAuth failed: ${error.message}`);
  }
  async function startServer(redirect_uri: string) {
    return new Promise((resolve, reject) => {
      const app = express();
      const server = app.listen(3333, () => {
        console.log(`OAuth server listening on ${redirect_uri}`);
      });
      app.get(
        '/auth/callback',
        oAuthController.getTemporaryCode,
        oAuthController.getUserData,
        oAuthController.requestToken,
        oAuthController.saveUser,
        cookieController.setSSIDCookie,
        sessionController.startSession,
        (req, res) => {
          res.status(200).send('Authorization successful');
          server.close();
          resolve(res.locals.token as string);
        }
      );
    });
  }

  // async function getGithubToken(
  //   client_id: string,
  //   client_secret: string,
  //   code: string
  // ) {
  //   const response = await fetch(
  //     'https://github.com/login/oauth/access_token',
  //     {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         clientId: client_id,
  //         clientSecret: client_secret,
  //         code: code,
  //       }),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     }
  //   );
  //   if (!response.ok) {
  //     throw new Error('failed to get access token');
  //   }
  //   const data = await response.json();
  //   return data.access_token;
  // }
}

// const code = req.query.code;
// if (code) {
//   res.status(201).send('Authorization was successful!');
//   server.close();
//   resolve(code as string); //send code back to the user
// }
// res.status(400).send('Authorization failed');
// server.close();
