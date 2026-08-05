import { Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function HelpFab() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast('AI assistant is coming soon to KeshoGo', 'default')}
      aria-label="AI help assistant (coming soon)"
      className="fixed bottom-24 right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-secondary text-graphite shadow-float transition-transform active:scale-90 lg:bottom-6 lg:right-6"
    >
      <Sparkles size={22} />
    </button>
  );
}
