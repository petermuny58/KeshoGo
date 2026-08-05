import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, UserCircle2, Clapperboard, TrendingUp } from 'lucide-react';
import { Logo } from '../common/Logo';
import { SearchBar } from '../common/SearchBar';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { CategoryPill } from '../common/CategoryPill';
import { categories } from '../../data/categories';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export function TopHeader() {
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();

  return (
    <header className="sticky top-0 z-30">
      {/* Primary bar */}
      <div className="bg-primary px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3 lg:gap-6">
          <Link to="/" className="shrink-0" aria-label="KeshoGo home">
            <Logo variant="compact" className="text-xl sm:text-2xl" />
          </Link>

          {/* Desktop search + nav */}
          <div className="hidden flex-1 items-center gap-4 lg:flex">
            <SearchBar className="max-w-xl flex-1" />
            <nav className="flex items-center gap-1" aria-label="Secondary">
              <CategoryMegaMenu />
              <Link
                to="/trends"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-white/95 hover:bg-white/10"
              >
                <TrendingUp size={16} />
                Trends
              </Link>
              <Link
                to="/reels"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-white/95 hover:bg-white/10"
              >
                <Clapperboard size={16} />
                Reels
              </Link>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link
              to="/profile?tab=wishlist"
              aria-label={`Wishlist, ${wishlistIds.length} items`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:flex"
            >
              <Heart size={19} />
              {wishlistIds.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-secondary" />
              )}
            </Link>
            <Link
              to="/cart"
              aria-label={`Cart, ${itemCount} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-none text-graphite">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:flex"
            >
              <UserCircle2 size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="mt-3 lg:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Secondary category strip — desktop only (mobile shows this per-page where relevant) */}
      <div className="hidden border-b border-border-soft bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-8 py-2.5">
          {categories.map((cat) => (
            <CategoryPill key={cat.id} label={cat.name} icon={cat.icon} href={`/category/${cat.slug}`} size="sm" />
          ))}
        </div>
      </div>
    </header>
  );
}
