import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, Clock, TrendingUp, X, Store as StoreIcon } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterDrawer, type ProductFilters } from '../components/common/FilterDrawer';
import { sortProducts } from '../utils/sort';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { TRENDING_SEARCHES } from '../data/trending';
import { catalogApi, type CatalogProduct, type CatalogStore } from '../lib/catalog-api';
import { searchProducts } from '../data/products';

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { recentSearches, addSearch, clearHistory } = useSearchHistory();

  const [stores, setStores] = useState<CatalogStore[]>([]);
  const [apiProducts, setApiProducts] = useState<CatalogProduct[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) addSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setStores([]);
      setApiProducts(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    catalogApi
      .search(query.trim())
      .then((data) => {
        if (cancelled) return;
        setStores(data.stores);
        setApiProducts(data.products);
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to mock product search if API is down
        setStores([]);
        setApiProducts(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const results = useMemo(() => {
    if (apiProducts) return apiProducts;
    return searchProducts(query);
  }, [apiProducts, query]);

  const priceCeiling = useMemo(() => Math.max(100, ...results.map((p) => p.price), 0), [results]);
  const availableSizes = useMemo(() => Array.from(new Set(results.flatMap((p) => p.sizes))).sort(), [results]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'featured',
    maxPrice: priceCeiling,
    minRating: 0,
    sizes: [],
  });

  useEffect(() => {
    setFilters({ sortBy: 'featured', maxPrice: priceCeiling, minRating: 0, sizes: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, priceCeiling]);

  function runSearch(q: string) {
    setSearchParams(q ? { q } : {});
  }

  const effectiveMaxPrice = filters.maxPrice || priceCeiling;
  const filtered = results.filter((p) => {
    if (p.price > effectiveMaxPrice) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;
    if (filters.sizes.length > 0 && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
    return true;
  });
  const sorted = sortProducts(filtered, filters.sortBy);

  if (!query.trim()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {recentSearches.length > 0 && (
          <div className="mb-7">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-graphite">
                <Clock size={15} />
                Recent searches
              </h2>
              <button type="button" onClick={clearHistory} className="text-xs font-medium text-graphite-muted hover:text-primary">
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => runSearch(term)}
                  className="rounded-full border border-border-soft px-3.5 py-2 text-sm text-graphite hover:bg-surface-dim"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-graphite">
            <TrendingUp size={15} />
            Trending searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => runSearch(term)}
                className="rounded-full bg-surface-dim px-3.5 py-2 text-sm text-graphite hover:bg-border-soft"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-graphite">
          <Search size={16} className="text-graphite-muted" />
          <span>
            Results for <span className="font-semibold">&ldquo;{query}&rdquo;</span>
            {loading ? <span className="ml-2 text-graphite-muted">…</span> : null}
          </span>
          <button
            type="button"
            onClick={() => runSearch('')}
            aria-label="Clear search"
            className="rounded-full p-1 text-graphite-muted hover:bg-surface-dim"
          >
            <X size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-2 text-sm font-medium text-graphite lg:hidden"
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {stores.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-graphite">Stores</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <li key={store.id}>
                <Link
                  to={`/store/${store.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-3 transition-colors hover:bg-surface-dim"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                    {store.logoUrl || store.bannerUrl ? (
                      <img
                        src={store.logoUrl || store.bannerUrl || ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <StoreIcon size={20} className="text-primary" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-graphite">{store.name}</span>
                    <span className="block truncate text-xs text-graphite-muted">{store.tagline || 'Shop this store'}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-6">
        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          priceCeiling={priceCeiling}
          availableSizes={availableSizes}
          resultCount={sorted.length}
        />
        <div className="min-w-0 flex-1 pb-6">
          <h2 className="mb-3 text-sm font-semibold text-graphite">Products</h2>
          <ProductGrid
            products={sorted}
            emptyTitle={`Nothing found for "${query}"`}
            emptyDescription="Check the spelling, or try a broader search term."
          />
        </div>
      </div>
    </div>
  );
}
