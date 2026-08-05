import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-dim">
        <Icon size={28} className="text-graphite-muted" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-graphite">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-graphite-muted">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
