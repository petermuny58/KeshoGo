import { NavLink } from 'react-router-dom';
import { Home, User, LayoutGrid, Clapperboard, ShoppingCart, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/categories', label: 'Category', icon: LayoutGrid },
  { to: '/reels', label: 'Reels', icon: Clapperboard },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
];

export function BottomNav() {
  const { itemCount } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white lg:hidden"
    >
      <ul className="grid grid-cols-6">
        {TABS.map((tab) => (
          <li key={tab.to} className="min-w-0">
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-graphite-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex h-7 w-7 items-center justify-center">
                    <tab.icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                    {tab.to === '/cart' && itemCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-none text-graphite">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
