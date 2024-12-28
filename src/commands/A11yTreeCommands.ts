import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import {
  User,
  A11yTreeCommands,
  AccessibilityNode,
  AccessibilityTree,
  Compliance,
} from '../types/index.types';

const outputChannel = vscode.window.createOutputChannel('a11yTreeCommands');

const a11yTreeCommands: A11yTreeCommands = {
  async handleFetchTree(
    port: number,
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
      const browser = await puppeteer.launch({
        headless: true, // Runs in headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(url);

      // get skip link from list of links?!!!!!!

      async function findFocusedNode(
        node: AccessibilityNode
      ): Promise<AccessibilityNode | undefined> {
        if (node.focused) {
          return node;
        }

        for (const child of node.children || []) {
          const focusedNode = await findFocusedNode(child);
          if (focusedNode) {
            return focusedNode;
          }
        }

        return undefined;
      }

      let linkCount = 0;
      let compliance = { h1: null, skipLink: null };

      async function getTabIndex(
        page: any,
        compliance: Compliance
      ): Promise<AccessibilityNode[]> {
        let snap: AccessibilityNode | null =
          await page.accessibility.snapshot();
        const tabIndex: AccessibilityNode[] = [];

        while (snap) {
          await page.keyboard.press('Tab');
          snap = await page.accessibility.snapshot();

          if (!snap) {
            break; // Ensure snap is not null before proceeding
          }

          const focusedNode = await findFocusedNode(snap);
          if (!focusedNode) {
            break;
          }

          if (
            !compliance.skipLink &&
            (focusedNode.role = 'link') &&
            linkCount < 3
          ) {
            if (testForSkipLink(focusedNode)) {
              compliance.skipLink = focusedNode;
            }
            linkCount++;
          }
          // janky, but need to pass node to add compliances;
          checkNode(focusedNode, compliance);

          tabIndex.push(focusedNode);
        }

        return tabIndex;
      }

      const tabIndex = await getTabIndex(page, compliance);

      // Generate Puppeteer accessibility tree snapshot and cast it to our custom AccessibilityTree type
      const a11yTree =
        (await page.accessibility.snapshot()) as AccessibilityTree | null;

      if (!a11yTree) {
        throw new Error('Accessibility tree snapshot is null.');
      }

      await browser.close();

      // pass to guideline creator function
      // need to find a better way to get h1 compliance

      guidelineCreator(a11yTree, compliance);

      // Accessibility results saved: /A11y-Root-Extension/results/a11y-tree.json
      //const projectDirectoryName = await getUserSelectedProjectDirectoryName();

      const result = {
        url: url,
        tree: a11yTree,
        skipLink: compliance.skipLink,
        h1: compliance.h1,
        tabIndex: tabIndex,
      };

      // tabIndex -> {} ?

      // Save results
      const outputFolder = path.join(context.extensionPath, 'results');
      fs.mkdirSync(outputFolder, { recursive: true });

      const treeResultPath = path.join(outputFolder, 'a11y-tree.json');
      fs.writeFileSync(treeResultPath, JSON.stringify(result, null, 2));

      // Send results back to the webview

      // const pageSchema = new Schema({
      //   projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
      //   url: { type: String, required: true },
      //   tree: { type: String, required: true },
      //   skipLink: {
      //     type: String,
      //     required: [true, 'A skip link must be present'],
      //   },
      //   h1: { type: String, required: [true, 'An h1 tag must be present'] },
      //   tabIndex: {
      //     type: [String],
      //     required: [true, 'A tabIndex must be present'],
      //   },
      // });

      //look at user's directory.
      //if project with that directory name already exists, create a page using the a11ytree and attach to it.
      //if the project does not exist, we must 1.) create project, 2.) attach project to user, 3.) create a page using the a11ytree and attach to it.

      const resultDB = {
        url: result.url.toString(),
        tree: JSON.stringify(result.tree),
        skipLink: JSON.stringify(result.skipLink),
        h1: JSON.stringify(result.h1),
        tabIndex: result.tabIndex.map((node) => {
          return JSON.stringify(node);
        }),
      };

      const projectName = await getUserSelectedProjectDirectoryName();

      const targetUrl = 'https://a11y-root-webpage.onrender.com/pages';
      //const localhost = 'http://localhost:${port}/pages';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGithubId: user.githubId,
          projectName,
          newPage: resultDB,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      vscode.window.showInformationMessage(
        `Response Data -> ${JSON.stringify(responseData)}`
      );

      panel.webview.postMessage({
        command: 'parseTreeResult',
        success: true,
        message: result,
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

function guidelineCreator(
  tree: AccessibilityTree,
  compliance: Compliance
): void {
  treeCrawl(tree, compliance);
}

function treeCrawl(
  node: AccessibilityTree | AccessibilityNode,
  compliance: Compliance
): void {
  // if node has children array, loop through the children

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      treeCrawl(child, compliance);
    }
  } else {
    checkNode(node, compliance);
  }
}

// Add guideline properties based on node role

function checkNode(node: AccessibilityNode, compliance: Compliance) {
  node.compliance = true;
  node.complianceDetails = '';
  switch (node.role) {
    case 'link':
      if (testLink(node)) {
        node.compliance = false;
        node.complianceDetails += ' link text must provide meaningful context';
      }
      break;
    case 'button':
      node.compliance = node.name ? true : false;
      node.complianceDetails = node.name
        ? ''
        : 'Button does not have an accessible name.';
      break;

    case 'heading':
      if (!compliance.h1 && node.level === 1) {
        compliance.h1 = node;
      }
      testHeadersAndUpdateCompliance(node);
      break;

    default:
      break;
  }
}

const skipLinkRegex =
  /^(skip(\s|-)?link|main(\s|-)?content|primary(\s|-)?content|page(\s|-)?content|body(\s|-)?content|wrapper|container|app(\s|-)?content|site(\s|-)?content)$/i;

const nonContextualLinksRegex =
  /\b(click|click here|here|details|info|more|more info|read more|learn more|go here|this link|check this|tap here|see here|go to link|link)\b[.,!?]*/i;

// const text = link.innerText.trim().toLowerCase();
// nonSemanticRegex.test(link.text);

function testForSkipLink(node: AccessibilityNode) {
  const text = node.name?.trim().toLocaleLowerCase();
  let isSkipLink = false;
  if (text) {
    isSkipLink = skipLinkRegex.test(text);
  }
  return isSkipLink;
}
function testLink(node: AccessibilityNode) {
  const text = node.name?.trim().toLocaleLowerCase();

  if (!text) {
    return false;
  } // Early exit if text is empty or undefined

  const cleanedText = text.replace(/[.,!?]/g, ''); // Remove punctuation
  return nonContextualLinksRegex.test(cleanedText); // Test against regex
}

let lastHeadingLevel = 0;
let firstH1 = false;

function testHeadersAndUpdateCompliance(node: AccessibilityNode) {
  if (!node.name) {
    node.compliance = false;
    node.complianceDetails = 'Heading is missing an accessible name.';
    return;
  }
  // Validate heading hierarchy
  if (node.level !== undefined) {
    if (node.level === 1) {
      if (!firstH1) {
        firstH1 = true;
      } else {
        node.compliance = false;
        node.complianceDetails = 'Only one h1 per page';
      }
      lastHeadingLevel = node.level;
    } else if (lastHeadingLevel !== null && node.level > lastHeadingLevel + 1) {
      node.compliance = false;
      node.complianceDetails = `Improper heading hierarchy: ${
        node.level > lastHeadingLevel
          ? `Skipped from h${lastHeadingLevel} to h${node.level}.`
          : `Heading level decreased unexpectedly to h${node.level}.`
      }`;
    } else {
      // Update the last heading level if hierarchy is correct
      lastHeadingLevel = node.level;
    }
  } else {
    node.compliance = false;
    node.complianceDetails = 'Heading level is missing.';
  }
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
