import { useEffect, useRef, useState } from 'react';
import { ReelCard } from '../components/reels/ReelCard';
import { catalogApi, type CatalogReel } from '../lib/catalog-api';

export function Reels() {
  const [reels, setReels] = useState<CatalogReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogApi
      .listReels()
      .then((data) => setReels(data.reels))
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const index = Math.round(el.scrollTop / el.clientHeight);
      setActiveIndex(index);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [reels.length]);

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-8rem)] items-center justify-center text-sm text-graphite-muted">
        Loading reels…
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-8rem)] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-base font-semibold text-graphite">No reels yet</p>
        <p className="text-sm text-graphite-muted">When sellers publish short videos, they&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[calc(100dvh-8rem)] max-w-lg">
      <div
        ref={containerRef}
        className="h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth"
      >
        {reels.map((reel, i) => (
          <div key={reel.id} className="h-full w-full snap-start">
            <ReelCard reel={reel} isActive={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
          </div>
        ))}
      </div>
    </div>
  );
}
