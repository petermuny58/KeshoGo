import { useState } from 'react';
import { BadgeCheck, Store as StoreIcon } from 'lucide-react';
import type { Store } from '../../types';
import { StarRating } from '../common/StarRating';
import { getPlaceholderTone } from '../../utils/placeholder';
import { buildImageUrl, getProductPhotoId } from '../../data/productImages';
import { useToast } from '../../context/ToastContext';

interface StoreHeaderProps {
  store: Store;
  productCount: number;
}

export function StoreHeader({ store, productCount }: StoreHeaderProps) {
  const [following, setFollowing] = useState(false);
  const { showToast } = useToast();
  const tone = getPlaceholderTone(store.id);
  const coverPhotoId = getProductPhotoId(store.categorySlug, store.id, 0);

  return (
    <div className="border-b border-border-soft bg-white">
      <div
        className="h-28 bg-cover bg-center sm:h-36"
        style={{
          backgroundColor: tone.bg,
          ...(coverPhotoId ? { backgroundImage: `url(${buildImageUrl(coverPhotoId, 1000)})` } : {}),
        }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-5 sm:px-6">
        <div className="-mt-8 flex items-end justify-between gap-3 sm:-mt-10">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white shadow-card sm:h-20 sm:w-20"
            style={{ backgroundColor: tone.fg }}
          >
            <StoreIcon size={28} className="text-white" />
          </div>
          <button
            type="button"
            onClick={() => {
              setFollowing((f) => !f);
              showToast(following ? `Unfollowed ${store.name}` : `Following ${store.name}`, 'success');
            }}
            className={`mb-1 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              following ? 'bg-surface-dim text-graphite' : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-lg font-semibold text-graphite sm:text-xl">{store.name}</h1>
          {store.verified && <BadgeCheck size={18} className="fill-primary text-white" />}
        </div>
        <p className="mt-1 max-w-lg text-sm text-graphite-muted">{store.tagline}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-graphite-muted">
          <StarRating rating={store.rating} size={14} />
          <span>{store.followers.toLocaleString()} followers</span>
          <span>{productCount} products</span>
        </div>
      </div>
    </div>
  );
}
