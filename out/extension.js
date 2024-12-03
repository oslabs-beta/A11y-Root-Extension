"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const puppeteer = __importStar(require("puppeteer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// import { spawn, execSync } from 'child_process'; // spawn runs the server in a detached child process to avoid blocking the extension's (parent process); execSync checks if server is running
// let serverProcess: any; // represents the child process running the server
// const isServerActive = () => {
//   try {
//     execSync('http://localhost:3000');
//     return true;
//   } catch {
//     return false;
//   }
// };
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // const serverScript = context.asAbsolutePath('server.js'); // launches server when extension activates
    // if (!isServerActive) {
    //   serverProcess = spawn('node', [serverScript], {
    //     cwd: context.extensionPath,
    //     detached: true,
    //     stdio: 'ignore',
    //   });
    // }
    // serverProcess.unref(); // detaches the server process from parent (the extension) so it won't block the extension's lifecycle
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "a11y-root-extension" is now active!');
    // vscode.window.showInformationMessage('A11y Root Extension Activated!');
    // vscode.window.showInformationMessage('Server Successfully Launched!');
    // console.log('Server Successfully Launched!');
    // Clean up when extension is deactivated
    // context.subscriptions.push({
    //   dispose: () => {
    //     serverProcess ? process.kill(-serverProcess.pid) : (serverProcess = null);
    //   },
    // });
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
function openTab(context) {
    return vscode.commands.registerCommand('a11y-root-extension.openTab', () => {
        const panel = vscode.window.createWebviewPanel('a11yRootTab', 'A11y Root', vscode.ViewColumn.One, {
            enableScripts: true, // Allow scripts in the webview
            retainContextWhenHidden: true, // If true, the webview preserves its state when hidden.
            // Useful for panels that should retain their content and state when switching tabs.
            enableForms: true, // not sure if we need this
        });
        const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        // Replace placeholders with compiled resource URIs
        const mainJsUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'webview-dist', 'main.js')));
        const styleCssUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'style.css')));
        htmlContent = htmlContent
            .replace('{{main.js}}', mainJsUri.toString())
            .replace('{{style.css}}', styleCssUri.toString());
        panel.webview.html = htmlContent;
        // Listen for messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'fetchTree') {
                const { url } = message;
                try {
                    vscode.window.showInformationMessage(`Fetching accessibility data for: ${url}`);
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
                    vscode.window.showInformationMessage(`Accessibility results saved: ${treeResultPath}`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
                    vscode.window.showErrorMessage(`Failed to fetch accessibility data: ${errorMessage}`);
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
function deactivate() {
    // if (serverProcess) {
    //   process.kill(-serverProcess.pid);
    //   serverProcess = null;
    // }
}
//# sourceMappingURL=extension.js.map