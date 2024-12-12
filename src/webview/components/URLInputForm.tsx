import React, { useState, useEffect } from 'react';
import { postMessage } from '../helpers/vscodeHelper';

import { URLInputFormProps } from '../types';

function URLInputForm({ setPageResults, user }: URLInputFormProps) {
  const [url, setUrl] = useState<string>('http://127.0.0.1:5500/index.html');
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
      postMessage({ command: 'parseTree', url, user });
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
          setPageResults(message);

          console.log('Tree parsed successfully:', message);
          setError(null);
        } else {
          setError(message || 'Error parsing tree.');
        }
      }
    };

    window.addEventListener('message', messageHandler);
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
        required
      />
      {error && <p className='error-message'>{error}</p>}
      {loading ? (
        <span className='wiggle-emoji' aria-label='Loading'>
          🌱
        </span>
      ) : (
        <button type='submit'>Check Page</button>
      )}
    </form>
  );
}

export default URLInputForm;
