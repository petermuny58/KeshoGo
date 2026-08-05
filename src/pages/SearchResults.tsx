import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, Clock, TrendingUp, X } from 'lucide-react';
import { searchProducts } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterDrawer, type ProductFilters } from '../components/common/FilterDrawer';
import { sortProducts } from '../utils/sort';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { TRENDING_SEARCHES } from '../data/trending';

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { recentSearches, addSearch, clearHistory } = useSearchHistory();

  useEffect(() => {
    if (query.trim()) addSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => searchProducts(query), [query]);
  const priceCeiling = useMemo(() => Math.max(100, ...results.map((p) => p.price), 0), [results]);
  const availableSizes = useMemo(() => Array.from(new Set(results.flatMap((p) => p.sizes))).sort(), [results]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'featured',
    maxPrice: priceCeiling,
    minRating: 0,
    sizes: [],
  });

  // The route component persists across query changes (same /search route),
  // so filters must reset explicitly whenever the query — and therefore the
  // result set's price ceiling and size options — changes underneath it.
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
