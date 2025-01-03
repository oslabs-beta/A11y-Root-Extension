# **DEVELOPMENT TEAM NOTES**

See sections below for specified file's concerns and to-do's.

## **GENERAL README**

## **A11Y ROOT'S DEVELOPER RESOURCES**

## **FILE-SPECIFIC NOTES**

### **`main.ts`**

#### **_TO-DO's:_**

[ ] Clean codebase: get rid of main.ts
If possible, re-allocate the code in main.ts to reduce the number of unnecessary files.
Find a better place to declare this file's code. It seems strange that this file's only purpose is to declare and invoke acquireVsCodeApi.

##### **_DEV NOTES_**

- `<reference lib="dom" />`
  - This makes TypeScript recognize DOM elements.
  - Even though this is also set in `tsconfig.webview.json` as `"lib": ["DOM", "ES6"]`, for some reason TypeScript was not recognizing the config settings.

* `build:webview": "npx tsc -p tsconfig.webview.json`
  - Saving this line of code incase we need to revert/test `package.json` setup.
  <br/>
  <hr/>

### **`extension.ts`**

#### **_TO-DO's:_**

[ ] Research and remove `enableForms: true,` if this line is unnecessary.
<br/>
[ ] The exported `deactivate()` method at the bottom of the file does not seem to be working properly when user logs out, closes tab and reopens tab. This method should be called when the extension is <ins>deactivated</ins>.

##### **_DEV NOTES_**

- `import * as vscode from 'vscode'` ---> The imported module, referenced as alias `vscode`, contains the VS Code extensibility API.

- `context.subscriptions.push(openTab(context, 3000))` ---> Adds other extension functionality.

- `function openTab(context: vscode.ExtensionContext, port: number)` ---> When extension is activated, `openTab()` will run and contain all the functionality.

- `enableScripts: true,` ---> Allow scripts in the webview.
  <br/>
  `retainContextWhenHidden: true,` ---> If true, the webview preserves its state when hidden. This is useful for panels that should retain their content and state when switching tabs.
  <br/>
  `enableForms: true,` ---> not sure if we need this.

- `async handleUri(uri: vscode.Uri) {`

  - `if (uri.path === '/auth/callback') {` ---> If path is auth/callback, this will start the github oauth process.
    - `const query = new URLSearchParams(uri.query);`
    - `const code = query.get('code');` ---> Temporary code from github that is needed to continue oauth.
    - `try { const response = await fetch('https://a11yroot.dev/extension/callback?code=${code}',{method: 'GET',})` ---> Data is then retrieved by using the code in a fetch request.

- `await context.secrets.store('ssid', data._id);` ---> Store id in vscode secrets.

- `panel.webview.postMessage({ command: 'loggedIn', message: data,})` ---> Instead of only passing the username, the <ins>entire user</ins> (`data`) is passed.

- `if (message.command === 'parseTree')` ---> The `parseTree` command initializes `puppeteer`. It will parse the current url for an <ins>accessibility tree</ins> and interact with the page to build.

-

##### **_CLEANED COMMENTED OUT CODE:_**

- `import { createServer } from './server/server'`
- `const styleCssUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'style.css')));`
- `.replace('{{style.css}}', styleCssUri.toString());`

<br/>
  <hr/>
