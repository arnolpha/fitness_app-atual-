import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);