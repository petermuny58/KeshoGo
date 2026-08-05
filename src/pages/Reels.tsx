import { useEffect, useRef, useState } from 'react';
import { reels } from '../data/reels';
import { ReelCard } from '../components/reels/ReelCard';

export function Reels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = items.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: [0.6] },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="scrollbar-none h-[calc(100dvh_-_64px_-_64px)] snap-y snap-mandatory overflow-y-auto lg:h-[calc(100dvh_-_113px)]"
    >
      {reels.map((reel, i) => (
        <div key={reel.id} className="h-full w-full snap-start">
          <ReelCard reel={reel} isActive={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
        </div>
      ))}
    </div>
  );
}
