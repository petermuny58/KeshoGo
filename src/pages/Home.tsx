import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Timer } from 'lucide-react';
import { PromoCarousel } from '../components/common/PromoCarousel';
import { CategoryPill } from '../components/common/CategoryPill';
import { ProductCard } from '../components/product/ProductCard';
import { promotions } from '../data/promotions';
import { catalogApi, type CatalogCategory, type CatalogProduct } from '../lib/catalog-api';
import { resolveCategoryIcon } from '../utils/categoryIcons';

function useCountdown(hoursFromNow: number) {
  const [target] = useState(() => Date.now() + hoursFromNow * 3600_000);
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

function SectionHeading({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-xl font-semibold text-graphite sm:text-2xl">{title}</h2>
      {viewAllHref && (
        <Link to={viewAllHref} className="flex items-center gap-0.5 text-sm font-medium text-primary">
          See all
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function Home() {
  const { h, m, s } = useCountdown(6);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [saleProducts, setSaleProducts] = useState<CatalogProduct[]>([]);
  const [bestProducts, setBestProducts] = useState<CatalogProduct[]>([]);
  const [newProducts, setNewProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    void Promise.all([
      catalogApi.listCategories(),
      catalogApi.listProducts({ badge: 'SALE', limit: 12 }),
      catalogApi.listProducts({ sort: 'rating', limit: 10 }),
      catalogApi.listProducts({ badge: 'NEW', limit: 10 }),
    ])
      .then(([cats, sale, best, neu]) => {
        setCategories(cats.categories);
        setSaleProducts(sale.products);
        setBestProducts(best.products);
        setNewProducts(neu.products);
      })
      .catch(() => {
        /* empty home sections if API down */
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <PromoCarousel promotions={promotions} />

      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = resolveCategoryIcon(cat.icon);
          return (
            <CategoryPill key={cat.id} label={cat.name} icon={Icon} href={`/category/${cat.slug}`} />
          );
        })}
      </div>

      {saleProducts.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-graphite sm:text-2xl">Flash Deals</h2>
            <div className="flex items-center gap-1.5 rounded-full bg-graphite px-3 py-1.5 text-xs font-semibold text-white">
              <Timer size={13} />
              <span className="tabular-nums">
                {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {saleProducts.map((product) => (
              <div key={product.id} className="w-36 shrink-0 sm:w-44">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-9">
        <SectionHeading title="Trending Now" viewAllHref="/trends" />
        {bestProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
            {bestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-graphite-muted">New listings will show up here once sellers go live.</p>
        )}
      </section>

      {newProducts.length > 0 && (
        <section className="mt-9 pb-6">
          <SectionHeading title="Just Landed" />
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {newProducts.map((product) => (
              <div key={product.id} className="w-36 shrink-0 sm:w-44">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
