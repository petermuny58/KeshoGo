import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface CategoryPillProps {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function CategoryPill({ label, icon: Icon, href, active = false, onClick, size = 'md' }: CategoryPillProps) {
  const base =
    size === 'sm'
      ? 'px-3.5 py-2 text-xs gap-1.5'
      : 'px-4 py-2.5 text-sm gap-2';

  const classes = `inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium transition-colors duration-150 ${base} ${
    active
      ? 'border-primary bg-primary text-white'
      : 'border-border-soft bg-white text-graphite hover:border-primary/40 hover:bg-surface-dim'
  }`;

  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {label}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-pressed={active}>
      {content}
    </button>
  );
}
