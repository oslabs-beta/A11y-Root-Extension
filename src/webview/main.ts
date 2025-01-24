// See docs/DEV-README.md for FILE-SPECIFIC NOTES

// Declare the VS Code API
declare const acquireVsCodeApi: () => {
  window: any;
  postMessage: (message: { command: string; url?: string }) => void;
};

// Get the VS Code API
const vscode = acquireVsCodeApi();
