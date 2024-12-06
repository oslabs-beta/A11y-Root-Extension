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
    res.cookie('ssid', res.locals.ssid, { httpOnly: true, maxAge: 50 });
    //expires and maxage properties
    //secure: process.env.NODE_ENV === 'production' (may need this for https)
    return next();
  },
};

export default cookieController;
