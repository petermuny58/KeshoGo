import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { products } from '../data/products';
import { EDIT_COLLECTIONS, TRENDING_SEARCHES } from '../data/trending';
import { ProductCard } from '../components/product/ProductCard';

export function Trends() {
  const navigate = useNavigate();
  const trendingProducts = [...products].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp size={20} className="text-secondary-ink" />
        <h1 className="font-display text-2xl font-semibold text-graphite">Trends</h1>
      </div>
      <p className="mb-6 text-sm text-graphite-muted">What Zambia is shopping for right now.</p>

      <section className="mb-9">
        <h2 className="mb-3 text-base font-semibold text-graphite">Trending products</h2>
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {trendingProducts.map((product) => (
            <div key={product.id} className="w-36 shrink-0 sm:w-44">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-9">
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

      <section className="flex flex-col gap-10 pb-6">
        {EDIT_COLLECTIONS.map((edit) => {
          const editProducts = edit.productIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is (typeof products)[number] => Boolean(p));
          return (
            <div key={edit.id}>
              <h2 className="font-display text-xl font-semibold text-graphite">{edit.title}</h2>
              <p className="mt-1.5 max-w-xl font-body text-sm leading-relaxed text-graphite-muted">{edit.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
                {editProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
