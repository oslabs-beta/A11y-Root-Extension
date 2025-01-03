# **DEVELOPMENT TEAM NOTES**

See sections below for specified file's concerns and to-do's.

## **GENERAL README**

## **A11Y ROOT'S DEVELOPER RESOURCES**

## **FILE-SPECIFIC NOTES**

### **`main.ts`**

#### **_TO-DO's:_**

[] Clean codebase: get rid of main.ts
If possible, re-allocate the code in main.ts to reduce the number of unnecessary files.
Find a better place to declare this file's code. It seems strange that this file's only purpose is to declare and invoke acquireVsCodeApi.

##### **_DEV NOTES_**

- `<reference lib="dom" />`
  - This makes TypeScript recognize DOM elements;
  - Even though this is also set in tsconfig.webview.json as "lib": ["DOM", "ES6"] but for some reason TypeScript was not recognizing the config settings;

* `build:webview": "npx tsc -p tsconfig.webview.json`
  - Saving this line of code incase we need to revert/test package.json setup.
  <br/>
  <hr/>

### **`extension.ts`**

#### **_TO-DO's:_**

[]

##### **_DEV NOTES_**

- `?`
  - ?

* `?`
  - ?
  <br/>
    <hr/>
