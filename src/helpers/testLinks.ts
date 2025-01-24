import { AccessibilityNode } from '../types/index.types';

// checks for common skip link text patters
const skipLinkRegex =
  /^(skip(\s|-)?link|main(\s|-)?content|primary(\s|-)?content|page(\s|-)?content|body(\s|-)?content|wrapper|container|app(\s|-)?content|site(\s|-)?content)$/i;
// check for common non contextual link text
const nonContextualLinksRegex =
  /\b(click|click here|here|details|info|more|more info|read more|learn more|go here|this link|check this|tap here|see here|go to link|link)\b[.,!?]*/i;

// to check if it meet the skip link requirement by using the regular expression skipLinkRegex
export function testForSkipLink(node: AccessibilityNode) {
  const text = node.name?.trim().toLocaleLowerCase();
  let isSkipLink = false;
  if (text) {
    isSkipLink = skipLinkRegex.test(text);
  }
  return isSkipLink;
}

// using the regular expression nonContextualLinksRegex to test if a link has contextual meaning or not
export function testLink(node: AccessibilityNode) {
  const text = node.name?.trim().toLocaleLowerCase();

  if (!text) {
    return false;
  } // Early exit if text is empty or undefined

  const cleanedText = text.replace(/[.,!?]/g, ''); // Remove punctuation
  return nonContextualLinksRegex.test(cleanedText); // Test against regex
}
