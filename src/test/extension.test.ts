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

suite('Command Registration Test Suite', () => {
  test('Should register the openTab command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('a11y-root-extension.openTab'),
      'Command "a11y-root-extension.openTab" should be registered.'
    );
  });
});
