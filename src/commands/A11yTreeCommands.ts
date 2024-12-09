import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import {User} from '../webview/types';

type A11yTreeCommands = {
  handleFetchTree: (
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    url: string,
    user: User
  ) => Promise<void>;
};

type SerializedAXNode = {
  role: string; // The role of the node
  name?: string; // The accessible name of the node
  value?: string | number; // The accessible value of the node
  description?: string; // The accessible description of the node
  keyshortcuts?: string; // Keyboard shortcuts associated with the node
  roledescription?: string; // A description of the role
  valuetext?: string; // The text alternative of a value
  disabled?: boolean; // Whether the node is disabled
  expanded?: boolean; // Whether the node is expanded
  focused?: boolean; // Whether the node is focused
  modal?: boolean; // Whether the node is a modal
  multiline?: boolean; // Whether the node supports multiline text
  multiselectable?: boolean; // Whether the node supports multiple selections
  readonly?: boolean; // Whether the node is read-only
  required?: boolean; // Whether the node is required
  selected?: boolean; // Whether the node is selected
  checked?: boolean | 'mixed'; // Whether the node is checked, or mixed for tri-state checkboxes
  pressed?: boolean | 'mixed'; // Whether the node is pressed, or mixed for toggle buttons
  level?: number; // The level of the node in a hierarchy
  valuemin?: number; // The minimum value for the node
  valuemax?: number; // The maximum value for the node
  autocomplete?: string; // Autocomplete hints for text input nodes
  haspopup?: string; // The type of popup triggered by the node
  children?: SerializedAXNode[]; // Children of this node in the accessibility tree
};

//add additional properties to the SerializedAXNode to create our AccessibilityNode
type AccessibilityNode = SerializedAXNode & {
  compliance?: boolean; // Optional: Indicates compliance status
  complianceDetails?: string; // Optional: Additional details about compliance
};

//add additional properties to the AccessibilityNode to create our AccessibilityTree
type AccessibilityTree = AccessibilityNode & {
  role: 'RootWebArea';
  skipLink?: boolean; // flag for if tree contains a skipLink
  h1?: boolean; // flag for if tree contains one unique h1 (placed above main content)
};

const outputChannel = vscode.window.createOutputChannel('a11yTreeCommands');

const a11yTreeCommands: A11yTreeCommands = {
  async handleFetchTree(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    url: string,
    user: User
  ) {
    outputChannel.appendLine(`url passed to a11yTreeCommands${url}`);
    outputChannel.show();
    try {
      vscode.window.showInformationMessage(
        `Fetching accessibility data for: ${url}`
      );

      //const pageName = path.basename(url);

      // Launch Puppeteer and open the page
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      // Generate Puppeteer accessibility tree snapshot and cast it to our custom AccessibilityTree type
      const a11yTree =
        (await page.accessibility.snapshot()) as AccessibilityTree | null;

      if (!a11yTree) {
        throw new Error('Accessibility tree snapshot is null.');
      }

      await browser.close();

      // pass to guideline creator function
      guidelineCreator(a11yTree);

      // Accessibility results saved: /Users/ianbuchanan/Codesmith/A11y-Root-Extension/results/a11y-tree.json
      //const projectDirectoryName = await getUserSelectedProjectDirectoryName();

      // Save results
      const outputFolder = path.join(context.extensionPath, 'results');
      fs.mkdirSync(outputFolder, { recursive: true });

      const treeResultPath = path.join(outputFolder, 'a11y-tree.json');
      fs.writeFileSync(treeResultPath, JSON.stringify(a11yTree, null, 2));

      // const pageSchema = new Schema({
      //   projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
      //   url: { type: String, required: true },
      //   pageRole: { type: String },
      //   pageName: { type: String },
      //   tree: { type: String, required: true },
      //   skipLink: {
      //     type: Boolean,
      //     required: [true, 'A skip link must be present'],
      //   },
      //   h1: { type: Boolean, required: [true, 'An h1 tag must be present'] },
      // });

      // Send results back to the webview

      // const result = {
      //   url: url,
      //   pageRole: '',
      //   pageName: '',
      //   tree: a11yTree,
      //   skipLink: false,
      //   h1: false,
      // };

      //look at user's directory.
      //if project with that directory name already exists, create a page using the a11ytree and attach to it.
      //if the project does not exist, we must 1.) create project, 2.) attach project to user, 3.) create a page using the a11ytree and attach to it.
      const projectName = await getUserSelectedProjectDirectoryName();
      const response = await axios.post('http:localhost:3333/projects', {
        userGithubId: user.githubId,
        projectName
      });

      panel.webview.postMessage({
        command: 'parseTreeResult',
        success: true,
        message: a11yTree,
      });

      vscode.window.showInformationMessage(
        `Accessibility results saved: ${treeResultPath}`
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred.';
      vscode.window.showErrorMessage(
        `Failed to fetch accessibility data: ${errorMessage}`
      );
      panel.webview.postMessage({
        command: 'error',
        message: `Failed to fetch accessibility data: ${errorMessage}`,
      });
    }
  },
};

export default a11yTreeCommands;

export async function getUserSelectedProjectDirectoryName(): Promise<
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

function guidelineCreator(tree: AccessibilityTree): void {
  //tree.skipLink = //logic to determine true or false
  //tree.h1 = //logic to determine true or false

  //call treeCrawl on the root (tree.children)

  // possibly pass in a issue object tracker

  treeCrawl(tree);

  //check for issues
}

function treeCrawl(node: AccessibilityTree | AccessibilityNode): void {
  // if node has children array, loop through the children
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      treeCrawl(child);
    }
  } else {
    checkNode(node);
  }

  // if node add guideline properties (compliance: Boolean, complianceDetails: String)
  // add logic depending on what the role of the node is (eg. statictext, button, heading, etc.)
  node.compliance = false;
  node.complianceDetails = '';
}

//   // Add guideline properties based on node role
function checkNode(node: AccessibilityNode) {
  switch (node.role) {
    case 'link':
      if (testLink(node)) {
        node.compliance = true;
        node.complianceDetails = 'link text must provide meaningful context';
      }
    case 'button':
      node.compliance = node.name ? true : false;
      node.complianceDetails = node.name
        ? ''
        : 'Button does not have an accessible name.';
      break;

    case 'heading':
      node.compliance = !!node.name;
      node.complianceDetails = node.name
        ? ''
        : 'Heading is missing an accessible name.';
      break;

    case 'StaticText':
      node.compliance = true; // Assuming static text is always compliant
      node.complianceDetails = '';
      break;

    default:
      node.compliance = true;
      node.complianceDetails = '';
      break;
  }
}

const skipLinkRegex =
  /^#.*(skip|main|content|primary|main-content|page-content|primary-content|body-content|wrapper|container|app-content|app|site-content).*/;
const nonSemanticRegex =
  /\b(click here|here|more details|details|info|more info|more|details|read more|learn more|go here|this link|link)\b/i;
// const text = link.innerText.trim().toLowerCase();
// nonSemanticRegex.test(link.text);

function testLink(node: AccessibilityNode) {
  const text = node.name?.trim().toLocaleLowerCase();
  let isNotMeaningful = false;
  if (text) {
    isNotMeaningful = nonSemanticRegex.test(text);
  }
  return isNotMeaningful;
}
// The SerializedAXNode type represents nodes in an accessibility tree, and its role property defines the role of an element. These roles are based on the ARIA (Accessible Rich Internet Applications) roles and include native HTML roles as well as additional accessibility roles.

// Categories of Roles in ARIA
// Roles fall into the following categories:

// Abstract Roles: Used only in the ARIA specification and not directly implemented.
// Widget Roles: Interactive elements like buttons, sliders, and checkboxes.
// Document Structure Roles: Roles for organizing content, such as headings and sections.
// Landmark Roles: For high-level structure, like navigation or main content areas.
// Window Roles: Roles related to the application window, such as dialogs.
// Common Role Types
// Here are some common role values you might encounter in the SerializedAXNode:

// --Widget Roles--
// button
// checkbox
// radio
// slider
// spinbutton
// switch
// textbox
// combobox
// listbox
// menu
// menuitem
// menuitemcheckbox
// menuitemradio
// progressbar
// scrollbar
// tab
// tabpanel
// tree
// treeitem
// --Document Structure Roles--
// heading
// paragraph
// list
// listitem
// table
// row
// cell
// columnheader
// rowheader
// grid
// gridcell
// article
// section
// blockquote
// --Landmark Roles--
// banner
// complementary
// contentinfo
// form
// main
// navigation
// region
// search
// --Abstract Roles (Not Applicable in Trees)--
// command
// composite
// input
// landmark
// range
// roletype
// section
// structure
// widget
// --Native HTML Semantics (Automatically Inferred Roles)--
// link
// image
// staticText (often div or span without explicit semantics)
// generic (no semantic role)
