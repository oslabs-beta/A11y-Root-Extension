import { Request, Response, NextFunction } from 'express';
import SessionModel from '../models/sessionModel';

const sessionController = {
  startSession: async (req: Request, res: Response, next: NextFunction) => {
    console.log('got to session controller');
    try {
      if (!res.locals.ssid) {
        return next({
          log: 'Error in sessionController.startSession: Missing ssid in res.locals',
          status: 400,
          message: { err: 'Session ID is required to start a session' },
        });
      }
      const result = await SessionModel.findOne({ cookieId: res.locals.ssid });
      if (!result) {
        const session = await SessionModel.create({
          cookieId: res.locals.ssid,
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
