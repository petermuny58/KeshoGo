import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterDrawer, type ProductFilters } from '../components/common/FilterDrawer';
import { sortProducts } from '../utils/sort';
import { catalogApi, type CatalogCategory, type CatalogProduct } from '../lib/catalog-api';

export function CategoryListing() {
  const { slug = '' } = useParams();
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    Promise.all([catalogApi.listCategories(), catalogApi.listProducts({ category: slug, limit: 60 })])
      .then(([cats, prods]) => {
        if (cancelled) return;
        const match = cats.categories.find((c) => c.slug === slug) ?? null;
        if (!match) {
          setNotFound(true);
          return;
        }
        setCategory(match);
        setAllProducts(prods.products);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  useEffect(() => {
    setFilters({ sortBy: 'featured', maxPrice: priceCeiling, minRating: 0, sizes: [] });
  }, [slug, priceCeiling]);

  if (loading) {
    return <div className="px-6 py-16 text-center text-sm text-graphite-muted">Loading category…</div>;
  }

  if (notFound || !category) {
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
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="text-graphite">{category.name}</span>
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-graphite">{category.name}</h1>
          <p className="text-sm text-graphite-muted">{sorted.length} products</p>
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
          <ProductGrid products={sorted} emptyTitle="No products in this category yet" />
        </div>
      </div>
    </div>
  );
}
