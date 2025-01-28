import * as vscode from 'vscode';
import * as puppeteer from 'puppeteer';

import getTabIndex from '../helpers/getTabIndex';
import checkNode from '../helpers/checkNode';
import getUserSelectedProjectDirectoryName from '../helpers/getUserSelectedProjectDirectoryName';
import {
  User,
  A11yTreeCommands,
  AccessibilityNode,
  AccessibilityTree,
  Compliance,
} from '../types/index.types';

//Hight level view of what this file handles

// Create to pieces of data...
// - Array of a pages tab index through headless browser interaction
// - Accessibility Tree json object

// with the above data we are able to build up a compliance object
// that is used to populate a compliance/ accessability tree dashboard

// compliance object saved to user db under specific projects based on common directory

// {
//    url: result.url.toString(),
//    tree: JSON.stringify(result.tree),
//    skipLink: JSON.stringify(result.skipLink),
//    h1: JSON.stringify(result.h1),
//    tabIndex: result.tabIndex.map((node) => {
//        return JSON.stringify(node);
//    }),
// };

// Use for debugging
// const outputChannel = vscode.window.createOutputChannel('a11yTreeCommands');
// outputChannel.appendLine(`url passed to a11yTreeCommands${url}`);
// outputChannel.show();

const a11yTreeCommands: A11yTreeCommands = {
  async handleFetchTree(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    url: string,
    user: User
  ) {
    try {
      // inform user of what url is being checked
      vscode.window.showInformationMessage(
        `Fetching accessibility data for: ${url}`
      );

      // Launch Puppeteer and open the page
      const browser = await puppeteer.launch({
        headless: true, // Runs in headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // open tab in headless browser
      const page = await browser.newPage();
      // visit passed in url
      await page.goto(url);

      // set link count so we can track the first 3 focusable nodes for skip link
      let linkCount = 0;
      // set up partial compliance object to build out full compliance object later
      let compliance = { h1: null, skipLink: null };

      // tab through whole page, check for skip links and compile all tabbable nodes to an array

      const tabIndex = await getTabIndex(page, compliance, linkCount);

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

      // const outputFolder = path.join(context.extensionPath, 'results');
      // const treeResultPath = path.join(outputFolder, 'a11y-tree.json');

      // Save results to local files for testing
      //fs.mkdirSync(outputFolder, { recursive: true });
      //fs.writeFileSync(treeResultPath, JSON.stringify(result, null, 2));

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

      const targetUrl = 'https://a11yroot.dev/pages';

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

      panel.webview.postMessage({
        command: 'parseTreeResult',
        success: true,
        message: result,
      });
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

let lastHeadingLevel = 0;
let firstH1 = false;

// Adding compliance details to each element of the accessibility tree
function guidelineCreator(
  tree: AccessibilityTree,
  compliance: Compliance
): void {
  treeCrawl(tree, compliance);
}

// Add compliance details to the accessibility tree to each node and children nodes
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
    checkNode(node, compliance, lastHeadingLevel, firstH1);
  }
}
