import findFocusedNode from '../helpers/findFocusedNode';
import checkNode from './checkNode';
import { testForSkipLink } from './testLinks';

import { AccessibilityNode, Compliance } from '../types/index.types';

// tab through whole page, check for skip links and compile all tabbable nodes to an array

export default async function getTabIndex(
  page: any,
  compliance: Compliance,
  linkCount: number
): Promise<AccessibilityNode[]> {
  let snap: AccessibilityNode | null =
    // capture state of page
    await page.accessibility.snapshot();
  // setup array to collect all tabbable nodes/elements
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

    if (!compliance.skipLink && (focusedNode.role = 'link') && linkCount < 3) {
      if (testForSkipLink(focusedNode)) {
        compliance.skipLink = focusedNode;
      }
      linkCount++;
    }
    // janky, but need to pass node to add compliances;
    checkNode(focusedNode, compliance, null, null);

    tabIndex.push(focusedNode);
  }

  return tabIndex;
}
