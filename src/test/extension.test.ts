// // !!!! Run test by passing in test to NODE_ENV !!!!
// //  NODE_ENV=test npm run test

// import * as assert from 'assert';

// // You can import and use all API from the 'vscode' module
// // as well as import your extension to test it
// import * as vscode from 'vscode';
// // import * as myExtension from '../../extension';

// suite('Extension Test Suite', () => {
//   vscode.window.showInformationMessage('Start all tests.');

//   test('Sample test', () => {
//     assert.strictEqual(-1, [1, 2, 3].indexOf(5));
//     assert.strictEqual(-1, [1, 2, 3].indexOf(0));
//   });
// });

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Basic Extension Test Suite', () => {
  test('Should open a webview tab correctly', async () => {
    // Trigger the command to open the webview
    await vscode.commands.executeCommand('a11y-root-extension.openTab');

    // Check if the webview panel exists in the active panel list
    const openedWebviewPanel = vscode.window.tabGroups.all
      .flatMap((group) => group.tabs)
      .some((tab) => tab.label === 'A11y Root');

    assert.ok(
      openedWebviewPanel,
      'Webview tab was not created or could not be found.'
    );
  });
});
