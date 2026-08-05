import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getCategoryBySlug } from '../../data/categories';
import { getPlaceholderTone } from '../../utils/placeholder';
import { buildImageUrl, getProductPhotoId } from '../../data/productImages';

interface ProductImageProps {
  productId: string;
  categorySlug: string;
  imageIndex?: number;
  className?: string;
  iconClassName?: string;
}

/**
 * Renders real, category-matched product photography (sourced from Unsplash,
 * free-to-use license — see src/data/productImages.ts). The mock catalog's
 * SKUs are fictional, so photos are assigned deterministically per product
 * from a curated per-category pool rather than being an exact match to each
 * invented product name. If a photo fails to load (or a category has no
 * pool yet), this falls back to a soft brand-tinted tile with the category
 * icon, so the UI never shows a broken image.
 */
export function ProductImage({
  productId,
  categorySlug,
  imageIndex = 0,
  className = '',
  iconClassName = '',
}: ProductImageProps) {
  const category = getCategoryBySlug(categorySlug);
  const photoId = getProductPhotoId(categorySlug, productId, imageIndex);
  const [imgFailed, setImgFailed] = useState(false);

  if (photoId && !imgFailed) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img
          src={buildImageUrl(photoId)}
          alt={category?.name ?? 'Product photo'}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Fallback: tinted placeholder tile (no photo pool yet, or the image failed to load)
  const tone = getPlaceholderTone(`${productId}-${imageIndex}`);
  const Icon = category?.icon ?? ImageOff;
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: tone.bg }}
    >
      <Icon className={iconClassName || 'h-1/3 w-1/3'} style={{ color: tone.fg }} strokeWidth={1.5} />
    </div>
  );
}
