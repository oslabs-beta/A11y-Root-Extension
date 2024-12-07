import { Request, Response, NextFunction } from 'express';
import SessionModel from '../models/sessionModel';

const sessionController = {
  startSession: async (req: Request, res: Response, next: NextFunction) => {
    console.log('got to session controller');
    try {
      if (!res.locals.user._id) {
        return next({
          log: 'Error in sessionController.startSession: Missing ssid in res.locals',
          status: 400,
          message: { err: 'Session ID is required to start a session' },
        });
      }
      const result = await SessionModel.findOne({ cookieId: res.locals.user._id });
      if (!result) {
        const session = await SessionModel.create({
          cookieId: res.locals.user._id,
        });
        console.log('Session was created successfully:', session);
        return next();
      } else {
        console.log('Session already exists:', result);
        return next();
      }
    } catch {
      return next({
        log: 'Error in sessionController.startSession: Failed to start session',
        status: 500,
        message: { err: 'An error occurred while starting the session' },
      });
    }
  },
};

export default sessionController;


// import * as vscode from 'vscode';

// interface Session {
//   cookieId: string;
// }

// class SessionController {
//   private readonly state: vscode.Memento; // For storing session data

//   constructor(context: vscode.ExtensionContext) {
//     this.state = context.globalState; // Use global state for persistent storage
//   }

//   // Start a session
//   async startSession(cookieId: string): Promise<void> {
//     console.log('Got to session controller');

//     if (!cookieId) {
//       vscode.window.showErrorMessage('Session ID is required to start a session.');
//       return;
//     }

//     try {
//       const existingSession = this.state.get<Session>(cookieId);

//       if (!existingSession) {
//         const session: Session = { cookieId };
//         await this.state.update(cookieId, session); // Save the session

//         console.log('Session was created successfully:', session);
//         vscode.window.showInformationMessage('Session started successfully.');
//       } else {
//         console.log('Session already exists:', existingSession);
//         vscode.window.showInformationMessage('Session already exists.');
//       }
//     } catch (error) {
//       console.error('Error starting session:', error);
//       vscode.window.showErrorMessage('An error occurred while starting the session.');
//     }
//   }

//   // Fetch an existing session
//   async getSession(cookieId: string): Promise<Session | undefined> {
//     return this.state.get<Session>(cookieId);
//   }

//   // Clear a session
//   async clearSession(cookieId: string): Promise<void> {
//     try {
//       await this.state.update(cookieId, undefined);
//       console.log(`Session cleared for cookieId: ${cookieId}`);
//       vscode.window.showInformationMessage('Session cleared.');
//     } catch (error) {
//       console.error('Error clearing session:', error);
//       vscode.window.showErrorMessage('An error occurred while clearing the session.');
//     }
//   }
// }

// export default SessionController;

// // Usage Example in an Extension:
// export function activate(context: vscode.ExtensionContext) {
//   const sessionController = new SessionController(context);

//   context.subscriptions.push(
//     vscode.commands.registerCommand('extension.startSession', async () => {
//       const cookieId = await vscode.window.showInputBox({
//         prompt: 'Enter Session ID',
//       });
//       if (cookieId) {
//         await sessionController.startSession(cookieId);
//       }
//     }),
//     vscode.commands.registerCommand('extension.clearSession', async () => {
//       const cookieId = await vscode.window.showInputBox({
//         prompt: 'Enter Session ID to clear',
//       });
//       if (cookieId) {
//         await sessionController.clearSession(cookieId);
//       }
//     })
//   );
// }
