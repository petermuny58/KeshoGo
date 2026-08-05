import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface WishlistContextValue {
  wishlistIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      isWishlisted: (productId: string) => wishlistIds.includes(productId),
      toggleWishlist: (productId: string) =>
        setWishlistIds((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        ),
    }),
    [wishlistIds],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
