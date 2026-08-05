import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ rating, reviewCount, size = 14, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5${reviewCount ? ` from ${reviewCount} reviews` : ''}`}>
      <Star size={size} className="fill-star text-star" strokeWidth={0} />
      {showValue && <span className="text-xs font-medium text-graphite">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-xs text-graphite-muted">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
