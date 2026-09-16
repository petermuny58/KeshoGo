import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Store, Banknote, BarChart3, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppUserButton } from '../auth/AppUserButton';
import { Logo } from '../common/Logo';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/dashboard/earnings', label: 'Earnings', icon: Banknote },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function SellerShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border-soft bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center px-6">
          <Link to="/" className="flex items-center gap-2" aria-label="KeshoGo home">
            <Logo variant="compact" className="text-xl text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-muted">Seller</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1.5 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-graphite-muted hover:bg-surface-dim hover:text-graphite'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-soft p-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3">
            <AppUserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-graphite">Seller account</p>
              <Link to="/" className="text-xs text-primary hover:underline">
                Back to storefront
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-soft bg-white px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Store size={22} className="text-primary" />
          <span className="font-semibold text-graphite">Seller Dashboard</span>
        </Link>
        <AppUserButton />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white lg:hidden">
        <ul className="grid grid-cols-4 overflow-x-auto sm:grid-cols-7">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                    isActive ? 'text-primary' : 'text-graphite-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                    <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
