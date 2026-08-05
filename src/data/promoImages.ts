import { buildImageUrl } from './productImages';

/**
 * Hero background photo per promotion id (Unsplash, free-to-use license).
 * Paired with a dark gradient scrim in PromoCarousel so the white text
 * stays readable over any photo.
 */
const PROMO_PHOTO_IDS: Record<string, string> = {
  'promo-flash-friday': '1511707171634-5f897ff02aa9', // white smartphone near laptop
  'promo-fashion-drop': '1696962678565-bee84e6b9cb6', // woman in colorful dress and hat
  'promo-momo-cashback': '1592890288564-76628a30a657', // person holding smartphone (mobile money)
  'promo-back-to-school': '1611758497398-5224931d155a', // books on a shelf
  'promo-open-store': '1772570824145-e996a55204fb', // clothes displayed on racks in a store window
};

export function getPromoImageUrl(promoId: string, width = 1200): string | null {
  const photoId = PROMO_PHOTO_IDS[promoId];
  return photoId ? buildImageUrl(photoId, width) : null;
}
