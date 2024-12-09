let vscode: any = null;

if (typeof acquireVsCodeApi === 'function') {
  vscode = acquireVsCodeApi();
}

export const postMessage = (message: {
  command: string;
  [key: string]: any;
}) => {
  if (vscode) {
    vscode.postMessage(message);
  } else {
    console.warn('VS Code API is not available.');
  }
};
