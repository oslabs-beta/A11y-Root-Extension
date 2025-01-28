import * as vscode from 'vscode';
import * as path from 'path';

export default async function getUserSelectedProjectDirectoryName(): Promise<
  string | undefined
> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folders are open.');
    return undefined;
  }

  if (workspaceFolders.length === 1) {
    // Automatically select the single folder
    return path.basename(workspaceFolders[0].uri.fsPath);
  }

  // Allow the user to select a folder if multiple are open
  const selectedFolder = await vscode.window.showQuickPick(
    workspaceFolders.map((folder) => folder.uri.fsPath),
    {
      placeHolder: 'Select a workspace folder',
    }
  );

  return selectedFolder;
}
