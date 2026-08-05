import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : Info;
        return (
          <button
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto flex max-w-xs items-center gap-2 rounded-full bg-graphite px-4 py-2.5 text-sm font-medium text-white shadow-float"
          >
            <Icon
              size={16}
              className={
                toast.tone === 'success' ? 'text-primary-dark' : toast.tone === 'error' ? 'text-error' : 'text-secondary'
              }
              style={toast.tone === 'success' ? { color: '#8FBFA8' } : undefined}
            />
            {toast.text}
          </button>
        );
      })}
    </div>
  );
}
