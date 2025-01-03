import ReactDOM from 'react-dom/client'; // Correct import for React 18+
import App from './App';

// Get the root DOM element
const rootElement = document.getElementById('root');

if (rootElement) {
  // Create a React root and render the App component
  const root = ReactDOM.createRoot(rootElement); // Pass the DOM element here
  root.render(<App />); // Render the React component
} else {
  console.error('Root element not found');
}
