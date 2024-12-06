// import mongoose from 'mongoose';
// import * as dotenv from 'dotenv';
// dotenv.config();

// //contact Warren for URI key
// const MONGO_URI = process.env.MONGO_URI_KEY!;

// //when server initializes, check terminal for DB connection confirmation
// function dbConnect() {
//   mongoose
//     .connect(MONGO_URI, { dbName: 'a11yRoot' })
//     .then(() => {
//       console.log('Connected to Database.');
//     })
//     .catch((err: unknown) => {
//       console.log(`Database connection error: ${err}`);
//     });
// }

// export default dbConnect;

// Database connection error: The `uri` parameter to `openUri()` must be a string, got "undefined".
//  Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as vscode from 'vscode';
import path from 'path';

//dotenv.config();

// !!!! wil need to handle .env to use vscode secrets!

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Contact Warren for URI key
const MONGO_URI: string | undefined = process.env.MONGO_URI_KEY;

// Function to connect to the database with error handling
function dbConnect() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI undefined');
  }
  mongoose
    .connect(MONGO_URI, { dbName: 'a11yRoot' })
    .then(() => {
      console.log('Connected to Database.');
      vscode.window.showInformationMessage(
        'Connected to the database successfully.'
      );
    })
    .catch((err: unknown) => {
      console.error(`Database connection error: ${err}`);

      // Display error message in VS Code
      if (err instanceof Error) {
        vscode.window.showErrorMessage(
          `Database connection error: ${err.message}`
        );
      } else {
        vscode.window.showErrorMessage(
          'Unknown error occurred while connecting to the database.'
        );
      }
    });

  // Handle connection errors after initial connect
  mongoose.connection.on('error', (err: unknown) => {
    console.error(`Database connection error (post-connect): ${err}`);
    if (err instanceof Error) {
      vscode.window.showErrorMessage(
        `Database connection error: ${err.message}`
      );
    } else {
      vscode.window.showErrorMessage(
        'Unknown error occurred with the database connection.'
      );
    }
  });

  // Handle other events such as disconnects
  mongoose.connection.on('disconnected', () => {
    console.warn('Database connection lost.');
    vscode.window.showWarningMessage(
      'Database connection lost. Trying to reconnect...'
    );
  });
}

export default dbConnect;
