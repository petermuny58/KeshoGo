import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Volume2, VolumeX, Play, ShoppingBag, X, Store as StoreIcon } from 'lucide-react';
import type { CatalogReel } from '../../lib/catalog-api';
import { catalogApi } from '../../lib/catalog-api';
import { formatZmw } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface ReelCardProps {
  reel: CatalogReel;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export function ReelCard({ reel, isActive, muted, onToggleMute }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [tagOpen, setTagOpen] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const product = reel.product;
  const store = reel.store;

  async function handleLike() {
    try {
      const result = await catalogApi.toggleReelLike(reel.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? -1 : 1));
      showToast('Sign in to like reels', 'default');
    }
  }

  return (
    <div className="relative h-full w-full snap-start overflow-hidden bg-graphite">
      {isActive ? (
        <iframe
          title={reel.caption ?? 'Reel'}
          src={`${reel.iframeUrl}?autoplay=true&muted=${muted ? 'true' : 'false'}&controls=false&loop=true`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0">
          {reel.thumbnailUrl ? (
            <img src={reel.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-graphite">
              <Play size={26} className="fill-white text-white" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
              <Play size={26} className="ml-1 fill-white text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
      >
        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>

      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 sm:bottom-8">
        <button
          type="button"
          onClick={() => void handleLike()}
          aria-pressed={liked}
          aria-label="Like this reel"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <Heart size={22} className={liked ? 'fill-secondary text-secondary' : ''} />
          </span>
          <span className="text-xs font-medium">{likeCount.toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(`${window.location.origin}/reels`);
            showToast('Share link copied', 'success');
          }}
          aria-label="Share this reel"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <Share2 size={20} />
          </span>
          <span className="text-xs font-medium">Share</span>
        </button>

        {product && (
          <button
            type="button"
            onClick={() => setTagOpen(true)}
            aria-label={`View product: ${product.title}`}
            className="flex flex-col items-center gap-1 text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
              <ShoppingBag size={20} />
            </span>
            <span className="text-xs font-medium">Shop</span>
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-16 px-4 pr-16 text-white sm:bottom-6">
        <Link to={`/store/${store.slug}`} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <StoreIcon size={14} />
            )}
          </span>
          <span className="text-sm font-semibold">{store.name}</span>
        </Link>
        {reel.caption && <p className="mt-2 line-clamp-2 text-sm text-white/95">{reel.caption}</p>}
      </div>

      {tagOpen && product && (
        <div className="absolute inset-x-3 bottom-20 rounded-2xl bg-white p-3 shadow-float sm:inset-x-auto sm:bottom-8 sm:left-4 sm:w-72">
          <button
            type="button"
            onClick={() => setTagOpen(false)}
            aria-label="Close product preview"
            className="absolute right-2 top-2 rounded-full p-1 text-graphite-muted hover:bg-surface-dim"
          >
            <X size={15} />
          </button>
          <div className="flex gap-3 pr-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-dim">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium text-graphite hover:underline">
                {product.title}
              </Link>
              <p className="mt-1 text-sm font-semibold text-primary">{formatZmw(product.price)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id, 1);
              showToast('Added to cart', 'success');
              setTagOpen(false);
            }}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-white"
          >
            <ShoppingBag size={15} />
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
}
