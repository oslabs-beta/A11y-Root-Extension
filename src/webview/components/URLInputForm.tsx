import React, { useState, useEffect } from 'react';
import { postMessage } from '../helpers/vscodeHelper';

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

interface URLInputFormProps {
  setTree: (tree: AccessibilityTree) => void;
}

function URLInputForm({ setTree }: URLInputFormProps) {
  const [url, setUrl] = useState<string>('https://excalidraw.com/');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setError(null); // Clear any previous errors on input change
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate the URL
      new URL(url); // Throws if invalid
      console.log(`Submitting URL: ${url}`);

      // Post the message to the VS Code extension
      postMessage({ command: 'parseTree', url });
    } catch (err) {
      setError('Please enter a valid URL.');
      console.error('URL validation error:', err);
    } finally {
      setLoading(false); // Stop loading spinner regardless of success or error
    }
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const { command, success, message } = event.data;

      if (command === 'parseTreeResult') {
        if (success) {
          setTree(message);
          console.log('Tree parsed successfully:', message);
          setError(null);
        } else {
          setError(message || 'Error parsing tree.');
        }
      }
    };

    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <form id='url-form' onSubmit={handleSubmit}>
      <label htmlFor='url'>Enter URL:</label>
      <input
        type='url'
        id='url'
        value={url}
        onChange={handleInputChange}
        placeholder='https://example.com'
        required
      />
      {error && <p className='error-message'>{error}</p>}
      {loading ? (
        <span className='wiggle-emoji' aria-label='Loading'>
          🌱
        </span>
      ) : (
        <button type='submit'>Submit</button>
      )}
    </form>
  );
}

export default URLInputForm;
