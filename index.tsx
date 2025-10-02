
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Global error logging to prevent blank pages
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global window.onerror:", { message, source, lineno, colno, error });
  // You could also log this to a remote service
};

window.onunhandledrejection = (event) => {
  console.error("Global window.onunhandledrejection:", event.reason);
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);