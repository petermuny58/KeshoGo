import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, Store as StoreIcon, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { ProductImage } from '../components/product/ProductImage';
import { ProductGrid } from '../components/product/ProductGrid';
import { StarRating } from '../components/common/StarRating';
import { DealBadge } from '../components/common/DealBadge';
import { formatZmw } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { catalogApi, type CatalogProduct, type CatalogProductDetail } from '../lib/catalog-api';

export function ProductDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [related, setRelated] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [variantWarning, setVariantWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    catalogApi
      .getProduct(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setRelated(data.related);
        setActiveImage(0);
        setSelectedColor(undefined);
        setSelectedSize(undefined);
        setQuantity(1);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="px-6 py-20 text-center text-sm text-graphite-muted">Loading product…</div>;
  }

  if (notFound || !product) {
    return <Navigate to="/" replace />;
  }

  const store = product.store;
  const wishlisted = isWishlisted(product.id);
  const needsVariant =
    (product.colors.length > 0 && !selectedColor) || (product.sizes.length > 0 && !selectedSize);
  const imageCount = Math.max(1, product.images?.length || product.imageCount);
  const activeSrc = product.images?.[activeImage]?.url ?? product.imageUrl;

  function handleAddToCart(andCheckout = false) {
    if (needsVariant) {
      setVariantWarning(true);
      return;
    }
    setVariantWarning(false);
    const variant = product!.variants.find(
      (v) =>
        (selectedColor ? v.color === selectedColor : true) &&
        (selectedSize ? v.size === selectedSize : true),
    );
    addToCart(product!.id, quantity, selectedColor, selectedSize, variant?.id);
    if (andCheckout) {
      navigate('/checkout');
    } else {
      showToast('Added to cart', 'success');
    }
  }

  return (
    <div className="pb-28 lg:pb-10">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3 hidden items-center gap-1 text-xs text-graphite-muted lg:flex">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to={`/category/${product.categorySlug}`} className="hover:text-primary">
            {product.categorySlug}
          </Link>
          <ChevronRight size={12} />
          <span className="text-graphite">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
              <ProductImage
                productId={product.id}
                categorySlug={product.categorySlug}
                imageIndex={activeImage}
                src={activeSrc}
                className="h-full w-full"
                iconClassName="h-1/4 w-1/4"
              />
              {product.badge && (
                <div className="absolute left-2 top-2">
                  <DealBadge badge={product.badge} discountPercent={product.discountPercent} />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  showToast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', 'success');
                }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wishlisted}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card"
              >
                <Heart size={18} className={wishlisted ? 'fill-secondary-ink text-secondary-ink' : 'text-graphite'} />
              </button>
            </div>

            <div className="mt-3 flex gap-2.5 overflow-x-auto">
              {Array.from({ length: imageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeImage === i}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <ProductImage
                    productId={product.id}
                    categorySlug={product.categorySlug}
                    imageIndex={i}
                    src={product.images?.[i]?.url ?? product.imageUrl}
                    className="h-full w-full"
                    iconClassName="h-1/3 w-1/3"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-graphite-muted">{product.categorySlug}</p>
            <h1 className="mt-1 text-xl font-semibold text-graphite sm:text-2xl">{product.title}</h1>
            <div className="mt-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-2xl font-semibold text-graphite">{formatZmw(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-graphite-muted line-through">{formatZmw(product.originalPrice)}</span>
                  <span className="text-sm font-semibold text-secondary-ink">-{product.discountPercent}%</span>
                </>
              )}
            </div>

            {store && (
              <Link
                to={`/store/${store.slug}`}
                className="mt-4 flex items-center gap-2 rounded-xl border border-border-soft px-3.5 py-2.5 text-sm hover:bg-surface-dim"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <StoreIcon size={15} className="text-primary" />
                </span>
                <span className="flex-1 text-graphite">
                  Sold by <span className="font-medium">{store.name}</span>
                </span>
                <ChevronRight size={15} className="text-graphite-muted" />
              </Link>
            )}

            {product.colors.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-graphite">
                  Color{selectedColor ? `: ${selectedColor}` : ''}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                      aria-pressed={selectedColor === color}
                      className={`h-9 w-9 rounded-full border-2 transition-transform ${
                        selectedColor === color ? 'scale-110 border-primary' : 'border-border-soft'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-graphite">Size{selectedSize ? `: ${selectedSize}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-soft text-graphite hover:bg-surface-dim'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variantWarning && (
              <p className="mt-3 text-sm font-medium text-error" role="alert">
                Please select {product.colors.length > 0 && !selectedColor ? 'a color' : 'a size'} before adding to cart.
              </p>
            )}

            <div className="mt-5 flex items-center gap-4">
              <p className="text-sm font-medium text-graphite">Quantity</p>
              <div className="flex items-center rounded-full border border-border-soft">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center text-graphite disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center text-graphite disabled:opacity-40"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-graphite-muted">{product.stock} in stock</span>
            </div>

            <div className="mt-6 hidden gap-3 lg:flex">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40"
              >
                <ShoppingBag size={17} />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-border-soft pt-5 text-sm text-graphite-muted">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                Delivery available across Lusaka and major towns.
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                Pay securely with Mobile Money or card at checkout.
              </div>
            </div>

            <div className="mt-7 border-t border-border-soft pt-6">
              <h2 className="mb-2 text-base font-semibold text-graphite">Product Details</h2>
              <p className="font-body text-sm leading-relaxed text-graphite">{product.description}</p>
            </div>

            {product.reviews.length > 0 && (
              <div className="mt-7 border-t border-border-soft pt-6">
                <h2 className="mb-3 text-base font-semibold text-graphite">
                  Reviews <span className="text-graphite-muted">({product.reviewCount})</span>
                </h2>
                <div className="flex flex-col gap-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border-soft pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-graphite">{review.author}</span>
                        <span className="text-xs text-graphite-muted">{review.date}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={review.rating} showValue={false} size={12} />
                      </div>
                      <p className="mt-1.5 font-body text-sm leading-relaxed text-graphite-muted">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 font-display text-xl font-semibold text-graphite">You may also like</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-border-soft bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-xs text-graphite-muted">Total Price</p>
          <p className="text-lg font-semibold text-graphite">{formatZmw(product.price * quantity)}</p>
        </div>
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={product.stock === 0}
          aria-label="Add to cart"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-40"
        >
          <ShoppingBag size={17} />
          {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
