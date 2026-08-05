import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'default') => {
      const id = idRef.current++;
      setToasts((prev) => [...prev, { id, text, tone }]);
      window.setTimeout(() => dismissToast(id), 2600);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
