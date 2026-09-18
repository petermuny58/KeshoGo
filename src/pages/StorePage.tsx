import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { StoreHeader } from '../components/store/StoreHeader';
import { ProductGrid } from '../components/product/ProductGrid';
import { catalogApi, type CatalogProduct, type CatalogStore } from '../lib/catalog-api';

export function StorePage() {
  const { slug = '' } = useParams();
  const [store, setStore] = useState<CatalogStore | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    catalogApi
      .getStore(slug)
      .then((data) => {
        if (cancelled) return;
        setStore(data.store);
        setProducts(data.products);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center text-sm text-graphite-muted">Loading store…</div>
    );
  }

  if (notFound || !store) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <StoreHeader store={store} productCount={products.length} />
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <h2 className="mb-4 text-base font-semibold text-graphite">All products</h2>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
