import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { catalogApi, type CatalogCategory } from '../../lib/catalog-api';
import { resolveCategoryIcon } from '../../utils/categoryIcons';

export function CategoryMegaMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogApi
      .listCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-white/95 transition-colors hover:bg-white/10"
      >
        Categories
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 w-[560px] rounded-2xl border border-border-soft bg-white p-4 text-graphite shadow-float"
        >
          <div className="grid grid-cols-2 gap-1">
            {categories.map((cat) => {
              const Icon = resolveCategoryIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-dim"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dim">
                    <Icon size={17} className="text-primary" strokeWidth={1.75} />
                  </span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
