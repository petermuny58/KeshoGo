import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { TRENDING_SEARCHES } from '../data/trending';
import { ProductCard } from '../components/product/ProductCard';
import { catalogApi, type CatalogProduct } from '../lib/catalog-api';

export function Trends() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    catalogApi
      .listProducts({ sort: 'rating', limit: 12 })
      .then((data) => setTrendingProducts(data.products))
      .catch(() => setTrendingProducts([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp size={20} className="text-secondary-ink" />
        <h1 className="font-display text-2xl font-semibold text-graphite">Trends</h1>
      </div>
      <p className="mb-6 text-sm text-graphite-muted">What Zambia is shopping for right now.</p>

      <section className="mb-9">
        <h2 className="mb-3 text-base font-semibold text-graphite">Trending products</h2>
        {trendingProducts.length === 0 ? (
          <p className="text-sm text-graphite-muted">No live products yet.</p>
        ) : (
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {trendingProducts.map((product) => (
              <div key={product.id} className="w-36 shrink-0 sm:w-44">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-9 pb-6">
        <h2 className="mb-3 text-base font-semibold text-graphite">Trending searches</h2>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              className="rounded-full bg-surface-dim px-3.5 py-2 text-sm text-graphite hover:bg-border-soft"
            >
              {term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
