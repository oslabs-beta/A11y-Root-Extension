import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export default function initializeWebview(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
  const htmlPath = path.join(
    context.extensionPath,
    'dist',
    'webview',
    'index.html'
  );
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const bundleJsUri = panel.webview.asWebviewUri(
    vscode.Uri.file(
      path.join(context.extensionPath, 'dist', 'webview', 'bundle.js')
    )
  );

  htmlContent = htmlContent.replace('bundle.js', bundleJsUri.toString());
  panel.webview.html = htmlContent;
}
