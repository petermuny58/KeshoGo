import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ApiAuthProvider } from './components/auth/ApiAuthProvider';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { SearchHistoryProvider } from './context/SearchHistoryContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ApiAuthProvider>
        <ToastProvider>
          <LanguageProvider>
            <WishlistProvider>
              <CartProvider>
                <SearchHistoryProvider>
                  <App />
                </SearchHistoryProvider>
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </ToastProvider>
      </ApiAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
