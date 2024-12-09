import React from 'react';

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

type AccessibilityNode = SerializedAXNode & {
  compliance?: boolean; // Optional: Indicates compliance status
  complianceDetails?: string; // Optional: Additional details about compliance
};

function Element(node: AccessibilityNode) {
  return (
    <li>
      <span>{`role : ${node.name}`}</span>
      <span>{`name: ${node.name}`}</span>
      <span>{`compliance issue ${node.complianceDetails}`}</span>
    </li>
  );
}

export default Element;
