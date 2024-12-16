import React, { useState, useEffect } from 'react';
import { postMessage } from '../helpers/vscodeHelper';
import { URLSelectionFormProps } from '../types';

const URLSelectionForm = ({ setPageResults, user }: URLSelectionFormProps) => {
  const [url, setUrl] = useState<string>('http://127.0.0.1:5500/index.html');
  const [host, setHost] = useState<string>('localhost');
  const [port, setPort] = useState<string>('8080');
  const [page, setPage] = useState<string>('');
  const [customPort, setCustomPort] = useState<boolean>(false);
  const [customPage, setCustomPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const hosts = ['localhost', '127.0.0.1', '0.0.0.0'];
  const ports = ['3000', '8080', '5173', '5500'];
  const pages = ['', 'home', 'about', 'contact', 'dashboard'];

  //  <option value='127.0.0.1'>127.0.0.1</option>
  //         <option value='localhost'>localhost</option>
  //         <option value='0.0.0.0'>0.0.0.0</option>

  // Dynamically update the URL whenever host, port, or page changes
  useEffect(() => {
    const generatedURL = `http://${host}:${port}/${page}`;
    setUrl(generatedURL);
  }, [host, port, page]);

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
  }, [setPageResults]);

  return (
    <div>
      <form id='selection-form' onSubmit={handleSubmit}>
        <fieldset>
          <legend>Generate URL</legend>

          {/* Host Dropdown */}
          <label htmlFor='host'>Host:</label>
          <select
            id='host'
            name='host'
            value={host}
            onChange={(e) => setHost(e.target.value)}
          >
            {hosts.map((portOption) => (
              <option key={portOption} value={portOption}>
                {portOption}
              </option>
            ))}
          </select>

          {/* Port Dropdown or Input */}
          <label htmlFor='port'>Port:</label>
          {customPort ? (
            <input
              type='text'
              id='port'
              name='port'
              value={port}
              onChange={(e) => setPort(e.target.value)}
              onBlur={() => {
                if (!port.trim()) {
                  setPort('5500'); // Default value if empty
                  setCustomPort(false);
                }
              }}
            />
          ) : (
            <select
              id='port'
              name='port'
              value={port}
              onChange={(e) => setPort(e.target.value)}
            >
              {ports.map((portOption) => (
                <option key={portOption} value={portOption}>
                  {portOption}
                </option>
              ))}
            </select>
          )}
          <button type='button' onClick={() => setCustomPort((prev) => !prev)}>
            {customPort ? 'Use Dropdown' : 'Custom Port'}
          </button>

          {/* Page Dropdown or Input */}
          <label htmlFor='page'>Page:</label>
          {customPage ? (
            <input
              type='text'
              id='page'
              name='page'
              value={page}
              onChange={(e) => setPage(e.target.value)}
              onBlur={() => {
                if (!page.trim()) {
                  setPage('/');
                  setCustomPage(false);
                }
              }}
            />
          ) : (
            <select
              id='page'
              name='page'
              value={page}
              onChange={(e) => setPage(e.target.value)}
            >
              {pages.map((pageOption) => (
                <option key={pageOption} value={pageOption}>
                  {pageOption}
                </option>
              ))}
            </select>
          )}
          <button type='button' onClick={() => setCustomPage((prev) => !prev)}>
            {customPage ? 'Use Dropdown' : 'Custom Page'}
          </button>
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
        </fieldset>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <span id='generated-url'>
          Generated URL: <code>{url}</code>
        </span>
      </div>
    </div>
  );
};

export default URLSelectionForm;
