import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine, Product } from '../types';
import { buyerApi, type CartApiItem } from '../lib/buyer-api';
import { ApiError } from '../lib/api';

export interface CartLineWithProduct extends CartLine {
  id?: string;
  product: Product | undefined;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  linesWithProducts: CartLineWithProduct[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addToCart: (
    productId: string,
    quantity?: number,
    color?: string,
    size?: string,
    variantId?: string,
  ) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  setQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(line: { productId: string; color?: string; size?: string; variantId?: string }) {
  return `${line.productId}__${line.variantId ?? ''}__${line.color ?? ''}__${line.size ?? ''}`;
}

function fromApiItems(items: CartApiItem[]): CartLineWithProduct[] {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId ?? undefined,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
    product: item.product,
    lineTotal: item.lineTotal,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [linesWithProducts, setLinesWithProducts] = useState<CartLineWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await buyerApi.getCart();
      setLinesWithProducts(fromApiItems(data.items));
    } catch (err) {
      // Guests / unauthenticated — keep empty server cart
      if (err instanceof ApiError && err.status === 401) {
        setLinesWithProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    (productId: string, quantity = 1, color?: string, size?: string, variantId?: string) => {
      const existing = linesWithProducts.find(
        (l) =>
          lineKey(l) ===
          lineKey({ productId, color, size, variantId }),
      );
      const nextQty = (existing?.quantity ?? 0) + quantity;
      // Optimistic local update
      void buyerApi
        .upsertCartItem({ productId, variantId, quantity: nextQty })
        .then(() => refreshCart())
        .catch(() => {
          // fallback optimistic local-only line if API rejects (e.g. signed out)
          setLinesWithProducts((prev) => {
            const key = lineKey({ productId, color, size, variantId });
            const found = prev.find((l) => lineKey(l) === key);
            if (found) {
              return prev.map((l) =>
                lineKey(l) === key ? { ...l, quantity: l.quantity + quantity } : l,
              );
            }
            return [
              ...prev,
              {
                productId,
                quantity,
                color,
                size,
                variantId,
                product: undefined,
                lineTotal: 0,
              },
            ];
          });
        });
    },
    [linesWithProducts, refreshCart],
  );

  const removeFromCart = useCallback(
    (productId: string, color?: string, size?: string) => {
      const match = linesWithProducts.find(
        (l) => l.productId === productId && l.color === color && l.size === size,
      );
      if (match?.id) {
        void buyerApi
          .removeCartItem(match.id)
          .then(() => refreshCart())
          .catch(() =>
            setLinesWithProducts((prev) =>
              prev.filter((l) => !(l.productId === productId && l.color === color && l.size === size)),
            ),
          );
      } else {
        setLinesWithProducts((prev) =>
          prev.filter((l) => !(l.productId === productId && l.color === color && l.size === size)),
        );
      }
    },
    [linesWithProducts, refreshCart],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, color?: string, size?: string) => {
      const match = linesWithProducts.find(
        (l) => l.productId === productId && l.color === color && l.size === size,
      );
      if (!match) return;
      if (quantity <= 0) {
        removeFromCart(productId, color, size);
        return;
      }
      void buyerApi
        .upsertCartItem({
          productId,
          variantId: match.variantId,
          quantity,
        })
        .then(() => refreshCart())
        .catch(() =>
          setLinesWithProducts((prev) =>
            prev.map((l) =>
              l.productId === productId && l.color === color && l.size === size
                ? { ...l, quantity, lineTotal: (l.product?.price ?? 0) * quantity }
                : l,
            ),
          ),
        );
    },
    [linesWithProducts, refreshCart, removeFromCart],
  );

  const clearCart = useCallback(() => {
    void buyerApi
      .clearCart()
      .then(() => setLinesWithProducts([]))
      .catch(() => setLinesWithProducts([]));
  }, []);

  const lines = useMemo(
    () =>
      linesWithProducts.map(({ productId, quantity, color, size, variantId }) => ({
        productId,
        quantity,
        color,
        size,
        variantId,
      })),
    [linesWithProducts],
  );

  const itemCount = useMemo(
    () => linesWithProducts.reduce((sum, l) => sum + l.quantity, 0),
    [linesWithProducts],
  );

  const subtotal = useMemo(
    () => linesWithProducts.reduce((sum, l) => sum + l.lineTotal, 0),
    [linesWithProducts],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      linesWithProducts,
      itemCount,
      subtotal,
      loading,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      refreshCart,
    }),
    [
      lines,
      linesWithProducts,
      itemCount,
      subtotal,
      loading,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      refreshCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
