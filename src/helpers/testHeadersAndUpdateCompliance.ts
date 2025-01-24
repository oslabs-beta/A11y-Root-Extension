import { AccessibilityNode } from '../types/index.types';

export default function testHeadersAndUpdateCompliance(
  node: AccessibilityNode,
  lastHeadingLevel: number | null,
  firstH1: boolean | null
) {
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
