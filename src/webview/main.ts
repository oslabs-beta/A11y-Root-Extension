// Declare the VS Code API
// <reference lib="dom" /> This makes TypeScript recognize DOM elements
// this is also set in tsconfig.webview.json as "lib": ["DOM", "ES6"]
// but for some reason TypeScript was not recognizing the config settings
// saving this here incase we need to revert/test package.json setup "build:webview": "npx tsc -p tsconfig.webview.json"
/// <reference lib="dom" />

//npx tsc --project tsconfig.webview.json

//import axios from 'axios';

declare const acquireVsCodeApi: () => {
  postMessage: (message: { command: string; url?: string }) => void;
};

// Get the VS Code API
const vscode = acquireVsCodeApi();

console.log('hello!!!');

// Utility function to safely get an element by ID and assert its type
function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with ID "${id}" not found`);
  }
  return element as T;
}

// Add event listener for the "Submit" button
getElementById<HTMLButtonElement>('submitButton').addEventListener(
  'click',
  () => {
    const urlInput = getElementById<HTMLInputElement>('urlInput');
    const url = urlInput.value;

    const resultMessage = getElementById<HTMLParagraphElement>('resultMessage');
    const errorMessage = getElementById<HTMLParagraphElement>('errorMessage');

    if (url) {
      vscode.postMessage({ command: 'fetchTree', url });
      resultMessage.innerText = 'Processing...';
      errorMessage.innerText = '';
    } else {
      errorMessage.innerText = 'Please enter a valid URL.';
    }
  }
);

getElementById<HTMLButtonElement>('loginButton').addEventListener(
  'click',
  () => {
    const statusMessage = getElementById<HTMLParagraphElement>('statusMessage');
    statusMessage.innerText = 'Checking server health...';

    // Send a message to the extension to check server health
    vscode.postMessage({ command: 'checkHealth' });
  }
);

getElementById<HTMLButtonElement>('githubOauth').addEventListener(
  'click',
  () => {
    const statusMessage = getElementById<HTMLParagraphElement>('statusMessage');
    statusMessage.innerText = 'Starting OAuth process...';

    // Send a message to the extension to check server health
    vscode.postMessage({command: 'beginOAuth' });
  }
);


// Listen for messages from the extension
window.addEventListener('message', (event: MessageEvent) => {
  const { command, message } = event.data as {
    command: string;
    message: string;
  };

  const resultMessage = getElementById<HTMLParagraphElement>('resultMessage');
  const errorMessage = getElementById<HTMLParagraphElement>('errorMessage');

  if (command === 'result') {
    resultMessage.innerText = message;
    errorMessage.innerText = '';
  } else if (command === 'error') {
    errorMessage.innerText = message;
    resultMessage.innerText = '';
  }

  const statusMessage = getElementById<HTMLParagraphElement>('statusMessage');

  if (command === 'healthCheckResult') {
    // Display server health status
    statusMessage.innerText = message;
  } else if (command === 'healthCheckError') {
    // Display error
    statusMessage.innerText = `Error: ${message}`;
  }
});
