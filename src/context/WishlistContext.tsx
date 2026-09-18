import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buyerApi } from '../lib/buyer-api';
import { ApiError } from '../lib/api';

interface WishlistContextValue {
  wishlistIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    buyerApi
      .getWishlist()
      .then((data) => setWishlistIds(data.productIds))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) {
          /* ignore */
        }
      });
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        void buyerApi.removeWishlist(productId).catch(() => {});
        return prev.filter((id) => id !== productId);
      }
      void buyerApi.addWishlist(productId).catch(() => {});
      return [...prev, productId];
    });
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      isWishlisted: (productId: string) => wishlistIds.includes(productId),
      toggleWishlist,
    }),
    [wishlistIds, toggleWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
