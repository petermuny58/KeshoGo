import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { getProductsByCategory } from '../data/products';

export function CategoryIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-graphite">All Categories</h1>
      <p className="mt-1 text-sm text-graphite-muted">Browse everything on KeshoGo, by department.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex flex-col items-start gap-3 rounded-2xl border border-border-soft bg-white p-4 transition-colors hover:border-primary/40 hover:bg-surface-dim"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <cat.icon size={20} className="text-primary" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-graphite">{cat.name}</span>
              <span className="block text-xs text-graphite-muted">{getProductsByCategory(cat.slug).length} products</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
