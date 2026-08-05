import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Timer } from 'lucide-react';
import { PromoCarousel } from '../components/common/PromoCarousel';
import { CategoryPill } from '../components/common/CategoryPill';
import { ProductCard } from '../components/product/ProductCard';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { promotions } from '../data/promotions';

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

  const saleProducts = products.filter((p) => p.badge === 'sale');
  const bestProducts = [...products]
    .filter((p) => p.badge === 'bestseller' || p.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  const newProducts = products.filter((p) => p.badge === 'new').slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <PromoCarousel promotions={promotions} />

      {/* Category quick-links */}
      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <CategoryPill key={cat.id} label={cat.name} icon={cat.icon} href={`/category/${cat.slug}`} />
        ))}
      </div>

      {/* Flash deals */}
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

      {/* Trending now */}
      <section className="mt-9">
        <SectionHeading title="Trending Now" viewAllHref="/trends" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
          {bestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New arrivals */}
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
