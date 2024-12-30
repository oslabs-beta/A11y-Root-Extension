import React, { useState, useEffect } from 'react';
import { postMessage } from '../helpers/vscodeHelper';

import { URLInputFormProps } from '../../types/index.types';

function URLInputForm({
  setPageResults,
  user,
  setUrl,
  url,
}: URLInputFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setError(null); // Clear any previous errors on input change
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    setError(null);

    try {
      // Validate the URL
      new URL(url); // Throws if invalid
      console.log(`Submitting URL: ${url}`);

      // Post the message to the VS Code extension
      postMessage({ command: 'parseTree', url, user });
    } catch (err) {
      setLoading(false);
      setError('Please enter a valid URL.');
      console.error('URL validation error:', err);
    }
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const { command, success, message } = event.data;

      if (command === 'parseTreeResult') {
        setLoading(false);
        if (success) {
          setPageResults(message);
          console.log('Tree parsed successfully:', message);
          setError(null);
        } else {
          setError(message || 'Error parsing tree.');
        }
      }
      if (command === 'error') {
        setLoading(false);
        // need to fix how error messages are handled
        //setError(message);
      }
    };

    window.addEventListener('message', messageHandler);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='url'>Enter URL:</label>
      <input
        type='url'
        id='url'
        value={url}
        onChange={handleInputChange}
        placeholder='https://example.com'
        aria-label='URL to parse'
        required
      />
      {error && (
        <p className='error-message' role='alert'>
          {error}
        </p>
      )}
      <div className='submit-container'>
        {loading ? (
          <span className='parsing' aria-label='Parsing' role='status'>
            Parsing...
          </span>
        ) : (
          <button
            className='submit-button'
            type='submit'
            aria-label='Check Page Accessibility'
          >
            Check Page
          </button>
        )}
      </div>
    </form>
  );
}

export default URLInputForm;
