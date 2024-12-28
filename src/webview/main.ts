// Would like to find a better place to declare this
// !!! Seems strange all that this file does is declare and invoke acquireVsCodeApi !!!
// Declare the VS Code API
// <reference lib="dom" /> This makes TypeScript recognize DOM elements
// this is also set in tsconfig.webview.json as "lib": ["DOM", "ES6"]
// but for some reason TypeScript was not recognizing the config settings
// saving this here incase we need to revert/test package.json setup "build:webview": "npx tsc -p tsconfig.webview.json"
/// <reference lib="dom" />

declare const acquireVsCodeApi: () => {
  window: any;
  postMessage: (message: { command: string; url?: string }) => void;
};

// Get the VS Code API
const vscode = acquireVsCodeApi();
