import { Link } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../../types';
import { ProductImage } from './ProductImage';
import { DealBadge } from '../common/DealBadge';
import { StarRating } from '../common/StarRating';
import { formatZmw } from '../../utils/currency';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const wishlisted = isWishlisted(product.id);

  function handleWishlistClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', 'success');
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full">
        <ProductImage
          productId={product.id}
          categorySlug={product.categorySlug}
          src={product.imageUrl}
          className="h-full w-full"
          iconClassName="h-1/3 w-1/3 transition-transform duration-300 group-hover:scale-110"
        />

        {product.badge && (
          <div className="absolute left-1.5 top-1.5">
            <DealBadge badge={product.badge} discountPercent={product.discountPercent} />
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-graphite shadow-card backdrop-blur-sm transition-transform active:scale-90"
        >
          <Heart size={16} className={wishlisted ? 'fill-secondary-ink text-secondary-ink' : ''} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-graphite/85 px-2 py-1 text-center text-[10px] font-semibold text-white">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-graphite/85 px-2 py-1 text-center text-[10px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-2">
        <p className="line-clamp-2 text-[13px] leading-snug text-graphite sm:text-sm">{product.title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-graphite sm:text-base">{formatZmw(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-graphite-muted line-through">{formatZmw(product.originalPrice)}</span>
          )}
        </div>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />
      </div>
    </Link>
  );
}
