import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { SearchHistoryProvider } from './context/SearchHistoryContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
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
    </BrowserRouter>
  </StrictMode>,
);
