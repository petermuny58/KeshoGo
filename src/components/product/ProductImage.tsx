import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getCategoryBySlug } from '../../data/categories';
import { getPlaceholderTone } from '../../utils/placeholder';
import { buildImageUrl, getProductPhotoId } from '../../data/productImages';

interface ProductImageProps {
  productId: string;
  categorySlug: string;
  imageIndex?: number;
  src?: string | null;
  className?: string;
  iconClassName?: string;
}

/**
 * Renders real product photography when `src` is provided (API/R2), otherwise
 * category-matched Unsplash placeholders for the mock catalog.
 */
export function ProductImage({
  productId,
  categorySlug,
  imageIndex = 0,
  src,
  className = '',
  iconClassName = '',
}: ProductImageProps) {
  const category = getCategoryBySlug(categorySlug);
  const photoId = src ? null : getProductPhotoId(categorySlug, productId, imageIndex);
  const [imgFailed, setImgFailed] = useState(false);
  const imageSrc = src || (photoId ? buildImageUrl(photoId) : null);

  if (imageSrc && !imgFailed) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img
          src={imageSrc}
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
