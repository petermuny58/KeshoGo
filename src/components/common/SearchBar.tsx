import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { searchProducts } from '../../data/products';
import { formatZmw } from '../../utils/currency';
import { ProductImage } from '../product/ProductImage';

interface SearchBarProps {
  onFilterClick?: () => void;
  autoFocus?: boolean;
  initialQuery?: string;
  className?: string;
}

export function SearchBar({ onFilterClick, autoFocus, initialQuery = '', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const suggestions = query.trim().length > 0 ? searchProducts(query).slice(0, 5) : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToSearch(q: string) {
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={containerRef} className={`relative flex items-center gap-2 ${className}`}>
      <form
        role="search"
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) goToSearch(query);
        }}
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-muted"
          size={18}
        />
        <input
          type="search"
          inputMode="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search KeshoGo"
          aria-label="Search products"
          className="h-11 w-full rounded-full border border-border-soft bg-white pl-10 pr-9 text-sm text-graphite placeholder:text-graphite-muted focus:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-graphite-muted hover:bg-surface-dim"
          >
            <X size={15} />
          </button>
        )}

        {open && suggestions.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-float">
            {suggestions.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                    navigate(`/product/${product.slug}`);
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-surface-dim"
                >
                  <ProductImage
                    productId={product.id}
                    categorySlug={product.categorySlug}
                    className="h-10 w-10 shrink-0 rounded-lg"
                    iconClassName="h-4 w-4"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-graphite">{product.title}</span>
                    <span className="block text-xs font-medium text-primary">{formatZmw(product.price)}</span>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => goToSearch(query)}
                className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-primary hover:bg-surface-dim"
              >
                See all results for &ldquo;{query}&rdquo;
              </button>
            </li>
          </ul>
        )}
      </form>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Filters"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
}
