import { testLink } from './testLinks';
import testHeadersAndUpdateCompliance from './testHeadersAndUpdateCompliance';

import { AccessibilityNode, Compliance } from '../types/index.types';

// Add guideline properties based on node roles, which are link, button, and heading

export default function checkNode(
  node: AccessibilityNode,
  compliance: Compliance,
  lastHeadingLevel: number | null,
  firstH1: boolean | null
) {
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
      if (lastHeadingLevel !== null && firstH1 !== null) {
        testHeadersAndUpdateCompliance(node, lastHeadingLevel, firstH1);
      }

      break;

    default:
      break;
  }
}
