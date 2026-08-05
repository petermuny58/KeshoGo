import type { Reel } from '../types';

export const reels: Reel[] = [
  { id: 'reel-1', productId: 'prod-5', storeId: 'store-mwenya', caption: 'Three ways to style the Ankara wrap dress this week 🧵', likes: 2840 },
  { id: 'reel-2', productId: 'prod-11', storeId: 'store-urbanfit', caption: 'Bomber jacket, straight off the rack — true to size.', likes: 1920 },
  { id: 'reel-3', productId: 'prod-3', storeId: 'store-tekhaus', caption: 'JBL Go 3 sound test at full volume, no cap.', likes: 4310 },
  { id: 'reel-4', productId: 'prod-21', storeId: 'store-glownaturals', caption: 'Our shea butter cream, whipped fresh this batch.', likes: 3670 },
  { id: 'reel-5', productId: 'prod-50', storeId: 'store-playzone', caption: 'This RC car handles gravel better than expected.', likes: 5120 },
  { id: 'reel-6', productId: 'prod-27', storeId: 'store-freshbasket', caption: 'Pour-over with our medium roast, start to finish.', likes: 1540 },
  { id: 'reel-7', productId: 'prod-57', storeId: 'store-ngwena-gems', caption: 'Unboxing the sterling silver pendant — details up close.', likes: 2260 },
  { id: 'reel-8', productId: 'prod-37', storeId: 'store-urbanfit', caption: 'Match-day ball test: shape held after 90 minutes.', likes: 3980 },
  { id: 'reel-9', productId: 'prod-16', storeId: 'store-littleexplorers', caption: 'Rain boots vs. the muddiest puddle we could find.', likes: 1280 },
  { id: 'reel-10', productId: 'prod-12', storeId: 'store-urbanfit', caption: 'Canvas sneakers, one month of daily wear later.', likes: 2010 },
];

export function getReelById(id: string): Reel | undefined {
  return reels.find((r) => r.id === id);
}
