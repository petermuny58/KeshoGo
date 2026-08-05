import { Navigate, useParams } from 'react-router-dom';
import { stores } from '../data/stores';
import { getProductsByStore } from '../data/products';
import { StoreHeader } from '../components/store/StoreHeader';
import { ProductGrid } from '../components/product/ProductGrid';

export function StorePage() {
  const { slug = '' } = useParams();
  const store = stores.find((s) => s.slug === slug);

  if (!store) {
    return <Navigate to="/" replace />;
  }

  const storeProducts = getProductsByStore(store.id);

  return (
    <div>
      <StoreHeader store={store} productCount={storeProducts.length} />
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <h2 className="mb-4 text-base font-semibold text-graphite">All products</h2>
        <ProductGrid products={storeProducts} />
      </div>
    </div>
  );
}
