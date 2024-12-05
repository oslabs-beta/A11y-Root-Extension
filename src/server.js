// import express from 'express';
// import * as net from 'net';
// import * as vscode from 'vscode';

// export default async function startServer(
//   context: vscode.ExtensionContext,
//   port = 3000
// ): Promise<void> {
//   const app = express();

//   // Middleware to log requests
//   app.use((req, res, next) => {
//     console.log(`Received request: ${req.method} ${req.url}`);
//     next();
//   });

//   app.get('/', (req, res) => {
//     res.send('Welcome to the A11y Root Extension Server!');
//   });

//   app.get('/health', (req, res) => {
//     res.status(200).send('What up!');
//   });

//   const isPortAvailable = async (port: number): Promise<boolean> => {
//     return new Promise((resolve) => {
//       const tester = net
//         .createServer()
//         .once('error', (err: any) => {
//           if (err.code === 'EADDRINUSE') {
//             resolve(false);
//           } else {
//             resolve(true);
//           }
//         })
//         .once('listening', () => {
//           tester.close(() => resolve(true));
//         })
//         .listen(port);
//     });
//   };

//   if (!(await isPortAvailable(port))) {
//     vscode.window.showErrorMessage(`Port ${port} is already in use.`);
//     return;
//   }

//   // Start the server
//   const server = app.listen(port, 'localhost', async () => {
//     const externalUri = await vscode.env.asExternalUri(
//       vscode.Uri.parse(`http://localhost:${port}`)
//     );
//     console.log(`Server available at ${externalUri}`);
//     vscode.window.showInformationMessage(`Server started at ${externalUri}`);
//   });

//   server.on('error', (error) => {
//     console.error('Server encountered an error:', error);
//     vscode.window.showErrorMessage(`Server failed to start: ${error.message}`);
//   });

//   // Cleanup server on deactivate
//   context.subscriptions.push({
//     dispose: () => {
//       server.close(() => {
//         console.log('Server stopped.');
//         vscode.window.showInformationMessage('Server stopped.');
//       });
//     },
//   });
// }
