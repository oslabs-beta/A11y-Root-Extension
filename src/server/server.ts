import express from 'express';
import * as net from 'net';
import cors from 'cors';
import userRoute from './routes/userRoute';
import projectRoute from './routes/projectRoute';
import pageRoute from './routes/pageRoute';
import oAuthController from './controllers/oAuthController';
import sessionController from './controllers/sessionController';
import dbConnect from './dbConnect';

export function createServer(PORT: number, context: any) {
  const app = express();

  // Middleware setup
  app.use(cors({ origin: ['http://localhost:3333'], credentials: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // OAuth route
  app.get(
    '/auth/callback',
    oAuthController.getTemporaryCode,
    oAuthController.requestToken,
    oAuthController.getUserData,
    oAuthController.saveUser,
    sessionController.startSession,
    async (req, res) => {
      await context.secrets.store('ssid', res.locals.user._id);
      res.status(200).json(res.locals.user);
    }
  );

  // Other routes
  app.use('/users', userRoute);
  app.use('/projects', projectRoute);
  app.use('/pages', pageRoute);

  app.get('/', (req, res) =>
    res.send('Welcome to the A11y Root Extension Server!!!')
  );

  // Check if port is available
  const isPortAvailable = async (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const tester = net
        .createServer()
        .once('error', (err: any) =>
          err.code === 'EADDRINUSE' ? resolve(false) : resolve(true)
        )
        .once('listening', () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });
  };

  // Server creation
  let server: net.Server;
  const startServer = async () => {
    if (!(await isPortAvailable(PORT))) {
      throw new Error(`Port ${PORT} is already in use.`);
    }

    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error.message);
    });

    // Database connection
    dbConnect();
  };

  return {
    startServer,
    stopServer: () => {
      if (server) {
        server.close(() => {
          console.log('Server stopped.');
        });
      }
    },
  };
}
