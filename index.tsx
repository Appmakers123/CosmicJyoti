import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

function showRootError(msg: string) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200"><p class="text-amber-300 font-serif text-lg mb-4">Something went wrong</p><p class="text-slate-400 text-sm mb-4">' + msg.replace(/</g, '&lt;') + '</p><button onclick="window.location.reload()" class="px-4 py-2 bg-amber-600 text-slate-900 font-bold rounded-lg">Reload</button></div>';
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  showRootError('Could not find root element.');
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  showRootError(msg);
}