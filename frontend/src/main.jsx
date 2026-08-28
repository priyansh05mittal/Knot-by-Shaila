import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#FFF8F0',
                    color: '#4A3B3B',
                    border: '1px solid #E8D5C4',
                    borderRadius: '16px',
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 600,
                    padding: '12px 16px',
                  },
                  success: { iconTheme: { primary: '#D8A7B1', secondary: '#FFF8F0' } },
                  error: { iconTheme: { primary: '#C2818E', secondary: '#FFF8F0' } },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
