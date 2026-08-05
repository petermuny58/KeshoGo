import { X } from 'lucide-react';
import type { SortOption } from '../../types';
import { formatZmw } from '../../utils/currency';

export interface ProductFilters {
  sortBy: SortOption;
  maxPrice: number;
  minRating: number;
  sizes: string[];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  priceCeiling: number;
  availableSizes: string[];
  resultCount: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const RATING_OPTIONS = [4.5, 4, 3];

export function FilterDrawer({
  open,
  onClose,
  filters,
  onFiltersChange,
  priceCeiling,
  availableSizes,
  resultCount,
}: FilterDrawerProps) {
  function update(patch: Partial<ProductFilters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFiltersChange({ sortBy: 'featured', maxPrice: priceCeiling, minRating: 0, sizes: [] });
  }

  return (
    <div className={`${open ? 'fixed inset-0 z-50' : 'hidden'} lg:static lg:z-auto lg:block lg:w-64 lg:shrink-0`}>
      <div className="absolute inset-0 bg-graphite/40 lg:hidden" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort products"
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] shadow-float lg:static lg:max-h-none lg:overflow-visible lg:rounded-2xl lg:border lg:border-border-soft lg:p-5 lg:shadow-none"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border-soft lg:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-graphite">Filter & sort</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full p-1.5 text-graphite-muted hover:bg-surface-dim lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-muted">Sort by</legend>
          <div className="flex flex-col gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-graphite hover:bg-surface-dim"
              >
                <input
                  type="radio"
                  name="sort"
                  checked={filters.sortBy === opt.value}
                  onChange={() => update({ sortBy: opt.value })}
                  className="h-4 w-4 accent-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-graphite-muted">Max price</span>
            <span className="text-sm font-medium text-primary">{formatZmw(filters.maxPrice)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={Math.max(10, Math.round(priceCeiling / 100))}
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="h-2 w-full cursor-pointer accent-secondary"
            aria-label="Maximum price"
          />
        </div>

        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-muted">Rating</legend>
          <div className="flex flex-wrap gap-2">
            {RATING_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => update({ minRating: filters.minRating === r ? 0 : r })}
                aria-pressed={filters.minRating === r}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.minRating === r
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-soft text-graphite hover:bg-surface-dim'
                }`}
              >
                {r}+ stars
              </button>
            ))}
          </div>
        </fieldset>

        {availableSizes.length > 0 && (
          <fieldset className="mb-5">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite-muted">Size</legend>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected = filters.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      update({
                        sizes: selected ? filters.sizes.filter((s) => s !== size) : [...filters.sizes, size],
                      })
                    }
                    aria-pressed={selected}
                    className={`min-w-[2.5rem] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-soft text-graphite hover:bg-surface-dim'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 rounded-full border border-border-soft py-3 text-sm font-semibold text-graphite"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white"
          >
            Show {resultCount} results
          </button>
        </div>

        <button
          type="button"
          onClick={clearAll}
          className="mt-1 hidden text-xs font-medium text-graphite-muted underline-offset-2 hover:text-primary hover:underline lg:block"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
