import * as vscode from 'vscode';
import * as WebviewTypes from './webview.types';

export interface Compliance {
  h1: WebviewTypes.AccessibilityNode | null;
  skipLink: WebviewTypes.AccessibilityNode | null;
}

export interface A11yTreeCommands {
  handleFetchTree: (
    port: number,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    url: string,
    user: WebviewTypes.User
  ) => Promise<void>;
}
