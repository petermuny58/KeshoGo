import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Promotion } from '../../types';
import { getPromoImageUrl } from '../../data/promoImages';

interface PromoCarouselProps {
  promotions: Promotion[];
}

const SLIDE_BACKGROUNDS = ['#34584C', '#B5551A', '#253F36', '#8A6D4F', '#4A6B7A'];

export function PromoCarousel({ promotions }: PromoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    if (child) {
      track.scrollTo({ left: child.offsetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  // Autoplay, paused entirely if the user prefers reduced motion
  useEffect(() => {
    if (prefersReducedMotion || promotions.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % promotions.length;
        scrollToIndex(next);
        return next;
      });
    }, 5500);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, promotions.length, scrollToIndex]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(index);
  }

  function goTo(index: number) {
    setActive(index);
    scrollToIndex(index);
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl"
      >
        {promotions.map((promo, i) => {
          const photoUrl = getPromoImageUrl(promo.id);
          return (
          <div key={promo.id} className="w-full shrink-0 snap-center px-0.5">
            <div
              className="relative flex min-h-[168px] flex-col justify-center overflow-hidden rounded-2xl bg-cover bg-center px-6 py-7 sm:min-h-[200px] sm:px-10"
              style={{
                backgroundColor: SLIDE_BACKGROUNDS[i % SLIDE_BACKGROUNDS.length],
                ...(photoUrl ? { backgroundImage: `url(${photoUrl})` } : {}),
              }}
            >
              {photoUrl && (
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30"
                  aria-hidden="true"
                />
              )}
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-15"
                style={{ backgroundColor: '#FFFFFF' }}
                aria-hidden="true"
              />
              <p className="relative text-xs font-semibold uppercase tracking-wider text-white/90 [text-shadow:0_1px_4px_rgb(0_0_0_/_70%)]">
                {promo.eyebrow}
              </p>
              <h2 className="relative mt-1.5 max-w-xs font-display text-2xl font-semibold leading-tight text-white [text-shadow:0_1px_6px_rgb(0_0_0_/_70%)] sm:text-3xl">
                {promo.title}
              </h2>
              <p className="relative mt-2 max-w-sm text-sm text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_70%)]">
                {promo.subtitle}
              </p>
              <Link
                to={promo.ctaHref}
                className="relative mt-4 inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-graphite transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
              >
                {promo.ctaLabel}
              </Link>
            </div>
          </div>
          );
        })}
      </div>

      {promotions.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous promotion"
            onClick={() => goTo((active - 1 + promotions.length) % promotions.length)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-graphite shadow-card sm:flex"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next promotion"
            onClick={() => goTo((active + 1) % promotions.length)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-graphite shadow-card sm:flex"
          >
            <ChevronRight size={18} />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {promotions.map((promo, i) => (
              <button
                key={promo.id}
                type="button"
                aria-label={`Go to promotion ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === active ? 'w-5 bg-primary' : 'w-1.5 bg-border-soft'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
