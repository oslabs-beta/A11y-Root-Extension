"use strict";
// Declare the VS Code API
// <reference lib="dom" /> This makes TypeScript recognize DOM elements
// this is also set in tsconfig.webview.json as "lib": ["DOM", "ES6"]
// but for some reason TypeScript was not recognizing the config settings
/// <reference lib="dom" />
// Get the VS Code API
const vscode = acquireVsCodeApi();
// Utility function to safely get an element by ID and assert its type
function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with ID "${id}" not found`);
    }
    return element;
}
// Add event listener for the "Submit" button
getElementById('submitButton').addEventListener('click', () => {
    const urlInput = getElementById('urlInput');
    const url = urlInput.value;
    const resultMessage = getElementById('resultMessage');
    const errorMessage = getElementById('errorMessage');
    if (url) {
        vscode.postMessage({ command: 'fetchTree', url });
        resultMessage.innerText = 'Processing...';
        errorMessage.innerText = '';
    }
    else {
        errorMessage.innerText = 'Please enter a valid URL.';
    }
});
// Listen for messages from the extension
window.addEventListener('message', (event) => {
    const { command, message } = event.data;
    const resultMessage = getElementById('resultMessage');
    const errorMessage = getElementById('errorMessage');
    if (command === 'result') {
        resultMessage.innerText = message;
        errorMessage.innerText = '';
    }
    else if (command === 'error') {
        errorMessage.innerText = message;
        resultMessage.innerText = '';
    }
});
