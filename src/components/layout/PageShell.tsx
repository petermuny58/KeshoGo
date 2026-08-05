import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { HelpFab } from './HelpFab';
import { ToastViewport } from '../common/Toast';

export function PageShell() {
  const location = useLocation();

  // Move focus to the main region on route change, and reset scroll —
  // predictable back-behavior and screen-reader orientation on navigation.
  useEffect(() => {
    const main = document.getElementById('main-content');
    main?.focus();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <TopHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-20 outline-none lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      <HelpFab />
      <ToastViewport />
    </div>
  );
}
