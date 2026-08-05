import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { CartLine } from '../types';
import { getProductBySlug, products } from '../data/products';

interface CartState {
  lines: CartLine[];
}

type CartAction =
  | { type: 'ADD'; productId: string; quantity: number; color?: string; size?: string }
  | { type: 'REMOVE'; productId: string; color?: string; size?: string }
  | { type: 'SET_QUANTITY'; productId: string; quantity: number; color?: string; size?: string }
  | { type: 'CLEAR' };

function lineKey(line: { productId: string; color?: string; size?: string }): string {
  return `${line.productId}__${line.color ?? ''}__${line.size ?? ''}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const key = lineKey(action);
      const existing = state.lines.find((l) => lineKey(l) === key);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            lineKey(l) === key ? { ...l, quantity: l.quantity + action.quantity } : l,
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          { productId: action.productId, quantity: action.quantity, color: action.color, size: action.size },
        ],
      };
    }
    case 'REMOVE': {
      const key = lineKey(action);
      return { lines: state.lines.filter((l) => lineKey(l) !== key) };
    }
    case 'SET_QUANTITY': {
      const key = lineKey(action);
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => lineKey(l) !== key) };
      }
      return {
        lines: state.lines.map((l) => (lineKey(l) === key ? { ...l, quantity: action.quantity } : l)),
      };
    }
    case 'CLEAR':
      return { lines: [] };
    default:
      return state;
  }
}

export interface CartLineWithProduct extends CartLine {
  product: ReturnType<typeof getProductBySlug>;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  linesWithProducts: CartLineWithProduct[];
  itemCount: number;
  subtotal: number;
  addToCart: (productId: string, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  setQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  const linesWithProducts = useMemo<CartLineWithProduct[]>(() => {
    const result: CartLineWithProduct[] = [];
    for (const line of state.lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue;
      result.push({ ...line, product, lineTotal: product.price * line.quantity });
    }
    return result;
  }, [state.lines]);

  const itemCount = useMemo(
    () => state.lines.reduce((sum, l) => sum + l.quantity, 0),
    [state.lines],
  );

  const subtotal = useMemo(
    () => linesWithProducts.reduce((sum, l) => sum + l.lineTotal, 0),
    [linesWithProducts],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      linesWithProducts,
      itemCount,
      subtotal,
      addToCart: (productId, quantity = 1, color, size) =>
        dispatch({ type: 'ADD', productId, quantity, color, size }),
      removeFromCart: (productId, color, size) => dispatch({ type: 'REMOVE', productId, color, size }),
      setQuantity: (productId, quantity, color, size) =>
        dispatch({ type: 'SET_QUANTITY', productId, quantity, color, size }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }),
    [state.lines, linesWithProducts, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
