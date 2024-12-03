/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/webview/main.ts":
/*!*****************************!*\
  !*** ./src/webview/main.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n// Declare the VS Code API\n// <reference lib=\"dom\" /> This makes TypeScript recognize DOM elements\n// this is also set in tsconfig.webview.json as \"lib\": [\"DOM\", \"ES6\"]\n// but for some reason TypeScript was not recognizing the config settings\n// saving this here incase we need to revert/test package.json setup \"build:webview\": \"npx tsc -p tsconfig.webview.json\"\n/// <reference lib=\"dom\" />\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\n// Get the VS Code API\nconst vscode = acquireVsCodeApi();\nconsole.log('hello');\n// Utility function to safely get an element by ID and assert its type\nfunction getElementById(id) {\n    const element = document.getElementById(id);\n    if (!element) {\n        throw new Error(`Element with ID \"${id}\" not found`);\n    }\n    return element;\n}\n// Add event listener for the \"Submit\" button\ngetElementById('submitButton').addEventListener('click', () => {\n    const urlInput = getElementById('urlInput');\n    const url = urlInput.value;\n    const resultMessage = getElementById('resultMessage');\n    const errorMessage = getElementById('errorMessage');\n    if (url) {\n        vscode.postMessage({ command: 'fetchTree', url });\n        resultMessage.innerText = 'Processing...';\n        errorMessage.innerText = '';\n    }\n    else {\n        errorMessage.innerText = 'Please enter a valid URL.';\n    }\n});\n// Listen for messages from the extension\nwindow.addEventListener('message', (event) => {\n    const { command, message } = event.data;\n    const resultMessage = getElementById('resultMessage');\n    const errorMessage = getElementById('errorMessage');\n    if (command === 'result') {\n        resultMessage.innerText = message;\n        errorMessage.innerText = '';\n    }\n    else if (command === 'error') {\n        errorMessage.innerText = message;\n        resultMessage.innerText = '';\n    }\n});\n\n\n//# sourceURL=webpack://a11y-root-extension/./src/webview/main.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/webview/main.ts"](0, __webpack_exports__);
/******/ 	
/******/ })()
;