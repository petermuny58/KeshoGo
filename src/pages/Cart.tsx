import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductImage } from '../components/product/ProductImage';
import { EmptyState } from '../components/common/EmptyState';
import { formatZmw } from '../utils/currency';

const VALID_PROMO = 'KESHO10';

export function Cart() {
  const { linesWithProducts, subtotal, setQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  if (linesWithProducts.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty — start browsing"
          description="Everything you add will show up here, ready for checkout."
          actionLabel="Start browsing"
          actionHref="/"
        />
      </div>
    );
  }

  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const deliveryEstimate = subtotal > 500 ? 0 : 45;
  const total = subtotal - discount + deliveryEstimate;

  function handleApplyPromo() {
    if (promoCode.trim().toUpperCase() === VALID_PROMO) {
      setAppliedPromo(VALID_PROMO);
      showToast('Promo code applied — 10% off', 'success');
    } else {
      showToast('That code didn' + "'" + 't work. Try KESHO10.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-xl font-semibold text-graphite">Your Cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {linesWithProducts.map((line) => {
            const product = line.product!;
            return (
              <div
                key={`${line.productId}-${line.color ?? ''}-${line.size ?? ''}`}
                className="flex gap-3 rounded-2xl border border-border-soft bg-white p-3"
              >
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <ProductImage
                    productId={product.id}
                    categorySlug={product.categorySlug}
                    className="h-20 w-20 rounded-xl"
                    iconClassName="h-1/3 w-1/3"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium text-graphite hover:underline">
                      {product.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.productId, line.color, line.size)}
                      aria-label={`Remove ${product.title} from cart`}
                      className="shrink-0 rounded-full p-1.5 text-graphite-muted hover:bg-surface-dim hover:text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {(line.color || line.size) && (
                    <p className="mt-0.5 text-xs text-graphite-muted">
                      {line.color && (
                        <span className="mr-2 inline-flex items-center gap-1">
                          <span className="inline-block h-3 w-3 rounded-full border border-border-soft" style={{ backgroundColor: line.color }} />
                          Color
                        </span>
                      )}
                      {line.size && `Size: ${line.size}`}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-full border border-border-soft">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity - 1, line.color, line.size)}
                        aria-label="Decrease quantity"
                        className="flex h-8 w-8 items-center justify-center text-graphite"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity + 1, line.color, line.size)}
                        aria-label="Increase quantity"
                        disabled={line.quantity >= product.stock}
                        className="flex h-8 w-8 items-center justify-center text-graphite disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-graphite">{formatZmw(line.lineTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-border-soft bg-white p-4 lg:sticky lg:top-24">
          <h2 className="mb-3 text-base font-semibold text-graphite">Order Summary</h2>

          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="h-10 w-full rounded-full border border-border-soft pl-9 pr-3 text-sm placeholder:text-graphite-muted focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="h-10 shrink-0 rounded-full border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Apply
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-soft pt-3 text-sm">
            <div className="flex justify-between text-graphite-muted">
              <span>Subtotal</span>
              <span className="text-graphite">{formatZmw(subtotal)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-graphite-muted">
                <span>Promo ({appliedPromo})</span>
                <span className="text-primary">-{formatZmw(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-graphite-muted">
              <span>Delivery</span>
              <span className="text-graphite">{deliveryEstimate === 0 ? 'Free' : formatZmw(deliveryEstimate)}</span>
            </div>
            <div className="flex justify-between border-t border-border-soft pt-2 text-base font-semibold text-graphite">
              <span>Total</span>
              <span>{formatZmw(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
