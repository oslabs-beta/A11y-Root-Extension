// import express from 'express';
// import * as net from 'net';
// import cors from 'cors';
// import userRoute from './routes/userRoute';
// import projectRoute from './routes/projectRoute';
// import pageRoute from './routes/pageRoute';
// import oAuthController from './controllers/oAuthController';
// import sessionController from './controllers/sessionController';
// import dbConnect from './dbConnect';

// export function createServer(PORT: number, context: any) {
//   const app = express();

//   // Middleware setup
//   app.use(cors({ origin: ['http://localhost:3333'], credentials: true }));
//   app.use(express.urlencoded({ extended: true }));
//   app.use(express.json());

//   // OAuth route
//   app.get(
//     '/auth/callback',
//     oAuthController.getTemporaryCode,
//     oAuthController.requestToken,
//     oAuthController.getUserData,
//     oAuthController.saveUser,
//     sessionController.startSession,
//     async (req, res) => {
//       await context.secrets.store('ssid', res.locals.user._id);
//       res.status(200).json(res.locals.user);
//     }
//   );

//   // Other routes
//   app.use('/users', userRoute);
//   app.use('/projects', projectRoute);
//   app.use('/pages', pageRoute);

//   app.get('/', (req, res) =>
//     res.send('Welcome to the A11y Root Extension Server!!!')
//   );

//   // Check if port is available
//   const isPortAvailable = async (port: number): Promise<boolean> => {
//     return new Promise((resolve) => {
//       const tester = net
//         .createServer()
//         .once('error', (err: any) =>
//           err.code === 'EADDRINUSE' ? resolve(false) : resolve(true)
//         )
//         .once('listening', () => {
//           tester.close(() => resolve(true));
//         })
//         .listen(port);
//     });
//   };

//   // Server creation
//   let server: net.Server;
//   const startServer = async () => {
//     if (!(await isPortAvailable(PORT))) {
//       throw new Error(`Port ${PORT} is already in use.`);
//     }

//     server = app.listen(PORT, '127.0.0.1', () => {
//       console.log(`Server running at http://127.0.0.1:${PORT}`);
//     });

//     server.on('error', (error) => {
//       console.error('Server error:', error.message);
//     });

//     // Database connection
//     dbConnect();
//   };

//   return {
//     startServer,
//     stopServer: () => {
//       if (server) {
//         server.close(() => {
//           console.log('Server stopped.');
//         });
//       }
//     },
//   };
// }

// portfinder.setBasePort(3000);
// portfinder.basePort = 5000;

// portfinder.highestPort = 6000;

// const findAvailablePort = async (startPort: number): Promise<number> => {
//   let port = startPort;
//   while (!(await isPortAvailable(port))) {
//     console.warn(`Port ${port} is in use. Trying next port...`);
//     port += 1;
//   }
//   return port;
// };
// const isPortAvailable = async (port: number): Promise<boolean> => {
//   return new Promise((resolve) => {
//     const tester = net
//       .createServer()
//       .once('error', (err: any) => resolve(err.code !== 'EADDRINUSE'))
//       .once('listening', () => tester.close(() => resolve(true)))
//       .listen(port, '127.0.0.1');
//   });
// };

// next try is child=process

// import { exec } from 'child_process';

// function findRunningPorts() {
//   const command =
//     process.platform === 'win32' ? 'netstat -ano' : 'lsof -i -P -n';
//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       vscode.window.showErrorMessage(`Error: ${error.message}`);
//       return;
//     }
//     vscode.window.showInformationMessage(stdout); // Display running ports info
//   });
// }

// findRunningPorts();
import express from 'express';
import cors from 'cors';
import * as net from 'net';
import getPort from 'get-port';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import userRoute from './routes/userRoute';
import projectRoute from './routes/projectRoute';
import pageRoute from './routes/pageRoute';
import oAuthController from './controllers/oAuthController';
import sessionController from './controllers/sessionController';
import dbConnect from './dbConnect';
import tcpPortUsed from 'tcp-port-used';

export function createServer(initialPort: number, context: any) {
  const app = express();
  let server: net.Server | null = null;
  let serverPort: number | null = null;

  // Middleware setup
  app.use((req, res, next) => {
    const origin = serverPort ? `http://localhost:${serverPort}` : '*';
    cors({ origin, credentials: true })(req, res, next);
  });

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

  app.get('/', (req, res) => {
    res.send('Welcome to the A11y Root Extension Server!!!');
  });

  // Function to find running ports
  async function findRunningPorts(): Promise<number[]> {
    const command =
      process.platform === 'win32' ? 'netstat -ano' : 'lsof -i -P -n';
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error) {
          console.error(`Error finding running ports: ${error.message}`);
          return resolve([]);
        }

        const ports: number[] = [];
        const lines = stdout.split('\n');
        for (const line of lines) {
          const match =
            process.platform === 'win32'
              ? line.match(/:\d+/)
              : line.match(/:\d{2,5}\s/);

          if (match) {
            const port = parseInt(match[0].replace(':', '').trim(), 10);
            if (!isNaN(port)) {
              ports.push(port);
            }
          }
        }
        resolve(ports);
      });
    });
  }

  async function verifyExcludedPorts(ports: number[]): Promise<Set<number>> {
    const inUsePorts: number[] = [];
    for (const port of ports) {
      if (await tcpPortUsed.check(port, '127.0.0.1')) {
        inUsePorts.push(port);
      }
    }
    return new Set(inUsePorts);
  }

  async function findPortInRange(
    startPort: number,
    endPort: number,
    exclude: number[] = []
  ): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
      if (!exclude.includes(port)) {
        const availablePort = await getPort({ port });
        if (availablePort === port) {
          return port; // Found an available port within range
        }
      }
    }
    throw new Error(
      `No available ports found in range ${startPort}-${endPort}`
    );
  }

  // should set these to 4000 and 5000 respectfully
  // using 5500 to 6000 range for testing and ensuring conflict avoidance
  const startPort = 5500;
  const endPort = 6000;

  // Start server
  const startServer = async () => {
    try {
      // Find running ports
      const excludedPorts = await findRunningPorts();

      // Verify excluded ports
      const verifiedExcludedPorts = await verifyExcludedPorts(excludedPorts);

      // Display verified excluded ports in VS Code
      vscode.window.showInformationMessage(
        `Excluded Ports: ${[...verifiedExcludedPorts].join(', ')}`
      );

      // Find an available port, excluding the running ones
      serverPort = await findPortInRange(startPort, endPort, [
        ...verifiedExcludedPorts,
      ]);

      // Start the server
      server = app.listen(serverPort, '127.0.0.1', () => {
        console.log(`Server running at http://localhost:${serverPort}`);
      });

      server.on('error', (error) => {
        console.error('Server error:', error.message);
      });

      // Establish database connection
      await dbConnect();
    } catch (error) {
      console.error('Failed to start server:', error);
      vscode.window.showErrorMessage(`Failed to start server: ${error}`);
      throw error;
    }
  };

  // Stop server
  const stopServer = () => {
    if (server) {
      server.close(() => {
        console.log('Server stopped.');
      });
    }
  };

  return {
    startServer,
    stopServer,
    getPort: () => serverPort,
  };
}
