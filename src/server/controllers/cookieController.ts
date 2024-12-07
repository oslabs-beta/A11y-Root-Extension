import { Request, Response, NextFunction } from 'express';

const cookieController = {
  setSSIDCookie: async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;
    res.locals.ssid = user._id.toString();
    if (!res.locals.ssid) {
      return next({
        log: 'Error in cookieController.setSSIDCookie: no ssid found',
        status: 500,
        message: { err: 'An error occurred in finding the ssid' },
      });
    }
    console.log('SSID:', res.locals.ssid);
    res.cookie('ssid', res.locals.ssid, { httpOnly: true, maxAge: 6 * 60 * 60 * 1000 });
    //expires and maxage properties
    //secure: process.env.NODE_ENV === 'production' (may need this for https)
    return next();
  },
};

export default cookieController;


// import * as vscode from 'vscode';

// const cookieController = {
//   setSSID: async (user: { _id: string }, context: vscode.ExtensionContext): Promise<void> => {
//     const ssid = user._id.toString();

//     if (!ssid) {
//       throw new Error('Error in cookieController.setSSID: no ssid found');
//     }

//     console.log('SSID:', ssid);

//     // Store the SSID securely using vscode.SecretStorage
//     await context.secrets.store('ssid', ssid);

//     // Optional: Notify the user that the SSID has been set
//     vscode.window.showInformationMessage('Session ID has been set.');
//   },

//   getSSID: async (context: vscode.ExtensionContext): Promise<string | undefined> => {
//     // Retrieve the SSID securely
//     const ssid = await context.secrets.get('ssid');

//     if (!ssid) {
//       vscode.window.showErrorMessage('No session ID found.');
//     }

//     return ssid;
//   },
// };

// export default cookieController;

// async function authenticateUser(context: vscode.ExtensionContext) {
//   const user = { _id: '12345' }; // Replace with actual user data from authentication flow

//   try {
//     await cookieController.setSSID(user, context);
//     const ssid = await cookieController.getSSID(context);
//     console.log('Retrieved SSID:', ssid);
//   } catch (err) {
//     vscode.window.showErrorMessage(`Error during authentication: ${err.message}`);
//   }
// }

