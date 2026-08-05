import { PackageSearch } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * 2 / 3 / 4 / 5 columns across mobile / tablet / desktop / large-desktop,
 * per the KeshoGo breakpoint spec (sm=640, lg=1024, xl=1440).
 */
export function ProductGrid({
  products,
  emptyTitle = 'No products yet',
  emptyDescription = 'Try a different filter or check back soon.',
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
