// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "a11y-root-extension" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  // BOILERPLATE COMMAND
  // demonstrates how you can send info messages to users via vscode.window.showInformationMessage
  // const disposable = vscode.commands.registerCommand('a11y-root-extension.helloWorld', () => {
  // 	// The code you place here will be executed every time your command is executed
  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from A11y-Root-Extension!');
  // });

  //context.subscriptions.push(disposable);

  //context is an instance of vscode.ExtensionContext that is passed to the activate function of a VS Code extension.
  //subscriptions is a property of context. It is an array that holds disposables.
  //A disposable is any object that implements the dispose() method.
  //Disposables are used to clean up resources(e.g., listeners, commands, panels) when the extension is deactivated or a resource is no longer needed.

  // subscribe actions to context.subscriptions
  context.subscriptions.push(openTab(context));
}

// DEFINE TAB

//  Parameters of createWebviewPanel
// View Type ('simpleTab')
// A unique identifier for the webview panel.
// Used internally to distinguish this panel from others.
// Example: 'simpleTab'.

// Column (vscode.ViewColumn.One)
// Specifies which editor column the webview panel will appear in.
// Options:
// vscode.ViewColumn.One: Opens the webview in the first editor column.
// vscode.ViewColumn.Two: Opens the webview in the second editor column.
// vscode.ViewColumn.Active: Opens the webview in the currently active column.
// Example: vscode.ViewColumn.One opens it in the first column.

// Options (Configuration Object)
// An object that configures the behavior and features of the webview panel.

// enableScripts: true

// Allows the webview to run JavaScript.
// Default: false (disabled for security reasons).
// Example: enableScripts: true allows you to inject and execute scripts in the HTML displayed by the webview.
// Additional options (not used here but available):

// retainContextWhenHidden:
// If true, the webview preserves its state when hidden.
// Useful for panels that should retain their content and state when switching tabs.
// enableForms:
// Allows the webview to use forms.
// Default: true.

// The Return Value
// The function returns an instance of WebviewPanel, assigned to panel. You can use this object to manage the webview.

function openTab(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('a11y-root-extension.openTab', () => {
    const panel = vscode.window.createWebviewPanel(
      'a11yRootTab',
      'A11y Root',
      vscode.ViewColumn.One,
      {
        enableScripts: true, // Allow scripts in the webview
        retainContextWhenHidden: true, // If true, the webview preserves its state when hidden.
        // Useful for panels that should retain their content and state when switching tabs.
        enableForms: true, // not sure if we need this
      }
    );

    const htmlPath = path.join(
      context.extensionPath,
      'src',
      'webview',
      'index.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Replace placeholders with compiled resource URIs
    const mainJsUri = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, 'webview-dist', 'main.js')
      )
    );
    const styleCssUri = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, 'src', 'webview', 'style.css')
      )
    );

    htmlContent = htmlContent
      .replace('{{main.js}}', mainJsUri.toString())
      .replace('{{style.css}}', styleCssUri.toString());

    panel.webview.html = htmlContent;
    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'fetchTree') {
        const { url } = message;
        try {
          vscode.window.showInformationMessage(
            `Fetching accessibility data for: ${url}`
          );

          // Step 1: Launch Puppeteer and open the page
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.goto(url);

          // Step 2: Generate Puppeteer accessibility tree snapshot
          const a11yTree = await page.accessibility.snapshot();
          await browser.close();

          // Step 3: Save results
          const outputFolder = path.join(context.extensionPath, 'results');
          fs.mkdirSync(outputFolder, { recursive: true });

          const treeResultPath = path.join(outputFolder, 'a11y-tree.json');

          fs.writeFileSync(treeResultPath, JSON.stringify(a11yTree, null, 2));

          // Step 6: Send results back to the webview
          panel.webview.postMessage({
            command: 'result',
            message: `Results saved to:\n- ${treeResultPath}`,
          });

          vscode.window.showInformationMessage(
            `Accessibility results saved: ${treeResultPath}`
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred.';
          vscode.window.showErrorMessage(
            `Failed to fetch accessibility data: ${errorMessage}`
          );
          panel.webview.postMessage({
            command: 'error',
            message: `Failed to fetch accessibility data: ${errorMessage}`,
          });
        }
      }
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
