import type { ProductBadge } from '../../types';

interface DealBadgeProps {
  badge?: ProductBadge;
  discountPercent?: number | null;
  className?: string;
}

const TONE_STYLES: Record<string, { fill: string; text: string }> = {
  sale: { fill: '#FF8313', text: '#333333' }, // white-on-orange is 2.47:1 (fails AA); graphite clears 5.12:1
  new: { fill: '#34584C', text: '#FFFFFF' },
  bestseller: { fill: '#333333', text: '#FFFFFF' },
  'low-stock': { fill: '#C1443A', text: '#FFFFFF' },
};

function labelFor(badge: ProductBadge, discountPercent?: number | null): string | null {
  if (badge === 'sale' && discountPercent) return `-${discountPercent}%`;
  if (badge === 'sale') return 'SALE';
  if (badge === 'new') return 'NEW';
  if (badge === 'bestseller') return 'TOP';
  if (badge === 'low-stock') return 'LOW STOCK';
  return null;
}

/**
 * KeshoGo's signature mark is the hanging price tag from the logo. Every
 * discount / deal callout in the product grid reuses that tag silhouette —
 * a small string loop over a rounded tag body — instead of a generic ribbon.
 */
export function DealBadge({ badge, discountPercent, className = '' }: DealBadgeProps) {
  const label = labelFor(badge ?? null, discountPercent);
  if (!label) return null;
  const tone = TONE_STYLES[badge as string] ?? TONE_STYLES.sale;

  return (
    <div className={`relative ${className}`} style={{ width: label.length > 4 ? 62 : 46, height: 34 }}>
      <svg viewBox="0 0 62 40" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M25 2 L20 10 M31 2 L26 10" stroke={tone.fill} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
        <circle cx="25.5" cy="11.5" r="2.4" fill="none" stroke={tone.fill} strokeWidth="1.6" opacity="0.85" />
        <rect x="2" y="13" width="58" height="25" rx="5" fill={tone.fill} />
      </svg>
      <span
        className="absolute inset-x-0 bottom-0 flex items-center justify-center text-[10px] font-bold tracking-wide"
        style={{ color: tone.text, height: 25 }}
      >
        {label}
      </span>
    </div>
  );
}
