import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi, type CatalogCategory } from '../lib/catalog-api';
import { resolveCategoryIcon } from '../utils/categoryIcons';

export function CategoryIndex() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    catalogApi
      .listCategories()
      .then(async (data) => {
        setCategories(data.categories);
        const entries = await Promise.all(
          data.categories.map(async (cat) => {
            const res = await catalogApi.listProducts({ category: cat.slug, limit: 60 });
            return [cat.slug, res.products.length] as const;
          }),
        );
        setCounts(Object.fromEntries(entries));
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-graphite">All Categories</h1>
      <p className="mt-1 text-sm text-graphite-muted">Browse everything on KeshoGo, by department.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = resolveCategoryIcon(cat.icon);
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border-soft bg-white p-4 transition-colors hover:border-primary/40 hover:bg-surface-dim"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={20} className="text-primary" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-graphite">{cat.name}</span>
                <span className="block text-xs text-graphite-muted">{counts[cat.slug] ?? 0} products</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
