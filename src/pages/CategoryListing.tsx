import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { getCategoryBySlug, categories } from '../data/categories';
import { getProductsByCategory } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterDrawer, type ProductFilters } from '../components/common/FilterDrawer';
import { sortProducts } from '../utils/sort';

export function CategoryListing() {
  const { slug = '' } = useParams();
  const category = getCategoryBySlug(slug);
  const allProducts = useMemo(() => (category ? getProductsByCategory(category.slug) : []), [category]);

  const priceCeiling = useMemo(
    () => Math.max(100, ...allProducts.map((p) => p.price), 0),
    [allProducts],
  );
  const availableSizes = useMemo(
    () => Array.from(new Set(allProducts.flatMap((p) => p.sizes))).sort(),
    [allProducts],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'featured',
    maxPrice: priceCeiling,
    minRating: 0,
    sizes: [],
  });

  // The route component persists across /category/:slug changes (same route
  // pattern), so filters must reset explicitly when the category — and
  // therefore its price ceiling and size options — changes underneath it.
  useEffect(() => {
    setFilters({ sortBy: 'featured', maxPrice: priceCeiling, minRating: 0, sizes: [] });
  }, [category?.slug, priceCeiling]);

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  const effectiveMaxPrice = filters.maxPrice || priceCeiling;
  const filtered = allProducts.filter((p) => {
    if (p.price > effectiveMaxPrice) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;
    if (filters.sizes.length > 0 && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
    return true;
  });
  const sorted = sortProducts(filtered, filters.sortBy);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-graphite-muted">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-graphite">{category.name}</span>
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <category.icon size={19} className="text-primary" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-graphite sm:text-xl">{category.name}</h1>
            <p className="text-xs text-graphite-muted">{sorted.length} products</p>
          </div>
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

      {/* related category quick-switch */}
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
              cat.slug === category.slug
                ? 'border-primary bg-primary text-white'
                : 'border-border-soft text-graphite hover:bg-surface-dim'
            }`}
          >
            <cat.icon size={14} />
            {cat.name}
          </Link>
        ))}
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
            emptyTitle="No matches in this category yet"
            emptyDescription="Try widening your price range or clearing a filter."
          />
        </div>
      </div>
    </div>
  );
}
