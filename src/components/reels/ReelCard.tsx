import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Volume2, VolumeX, Play, ShoppingBag, X, Store as StoreIcon } from 'lucide-react';
import type { Reel } from '../../types';
import { products } from '../../data/products';
import { getStoreById } from '../../data/stores';
import { ProductImage } from '../product/ProductImage';
import { getPlaceholderTone } from '../../utils/placeholder';
import { formatZmw } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export function ReelCard({ reel, isActive, muted, onToggleMute }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const product = products.find((p) => p.id === reel.productId);
  const store = getStoreById(reel.storeId);
  const tone = getPlaceholderTone(reel.id);

  if (!product || !store) return null;

  return (
    <div className="relative h-full w-full snap-start overflow-hidden bg-graphite">
      {/* Placeholder "video" surface */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(160deg, ${tone.bg} 0%, ${tone.fg}22 100%)` }}
      >
        <ProductImage
          productId={product.id}
          categorySlug={product.categorySlug}
          className="h-full w-full"
          iconClassName="h-1/4 w-1/4 opacity-90"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
            <Play size={26} className="ml-1 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
      >
        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>

      {/* Right action rail */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 sm:bottom-8">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label="Like this reel"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <Heart size={22} className={liked ? 'fill-secondary text-secondary' : ''} />
          </span>
          <span className="text-xs font-medium">{(reel.likes + (liked ? 1 : 0)).toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={() => showToast('Share link copied', 'success')}
          aria-label="Share this reel"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <Share2 size={20} />
          </span>
          <span className="text-xs font-medium">Share</span>
        </button>

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
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-16 px-4 pr-16 text-white sm:bottom-6">
        <Link to={`/store/${store.slug}`} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <StoreIcon size={14} />
          </span>
          <span className="text-sm font-semibold">{store.name}</span>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-white/95">{reel.caption}</p>
      </div>

      {/* Product tag mini add-to-cart */}
      {tagOpen && (
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
            <ProductImage
              productId={product.id}
              categorySlug={product.categorySlug}
              className="h-16 w-16 shrink-0 rounded-xl"
              iconClassName="h-6 w-6"
            />
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
