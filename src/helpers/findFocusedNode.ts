import { AccessibilityNode } from '../types/index.types';

// search current tree of elements to find the node that is focused

export default async function findFocusedNode(
  node: AccessibilityNode
): Promise<AccessibilityNode | undefined> {
  // return node that is focused (node that was tabbed to) and return it
  if (node.focused) {
    return node;
  }
  // if node has children, check children for focused node
  for (const child of node.children || []) {
    const focusedNode = await findFocusedNode(child);
    if (focusedNode) {
      return focusedNode;
    }
  }

  return undefined;
}
