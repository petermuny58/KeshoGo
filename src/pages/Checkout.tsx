import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Check, ChevronLeft, CircleCheck, MapPin, CreditCard, ClipboardList, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/product/ProductImage';
import { formatZmw, formatNgwee } from '../utils/currency';
import { buyerApi } from '../lib/buyer-api';
import { useToast } from '../context/ToastContext';

type Step = 'address' | 'payment' | 'review';
type PaymentMethod = 'airtel' | 'momo' | 'card';

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine: string;
  town: string;
  notes: string;
}

const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
];

export function Checkout() {
  const { linesWithProducts, subtotal, clearCart, refreshCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('address');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState<AddressForm>({
    fullName: '',
    phone: '',
    addressLine: '',
    town: 'Lusaka',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [momoNumber, setMomoNumber] = useState('');

  const deliveryEstimate = subtotal > 500 ? 0 : 45;
  const total = subtotal + deliveryEstimate;

  if (linesWithProducts.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />;
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CircleCheck size={30} className="text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-graphite">Order placed</h1>
        <p className="mt-1.5 text-sm text-graphite-muted">
          Order <span className="font-medium text-graphite">#{orderNumber}</span> is recorded.
          {paymentNote ? ` ${paymentNote}` : ' You\u2019ll get updates by SMS as it\u2019s prepared for delivery.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const addressValid = address.fullName.trim() && address.phone.trim() && address.addressLine.trim();
  const paymentValid = paymentMethod === 'card' || momoNumber.trim().length >= 9;

  function goToStep(target: Step) {
    setStep(target);
  }

  async function handlePlaceOrder() {
    setSubmitting(true);
    try {
      const method =
        paymentMethod === 'airtel' ? 'AIRTEL_MONEY' : paymentMethod === 'momo' ? 'MTN_MOMO' : 'CARD';
      const result = await buyerApi.createOrder({
        shippingFullName: address.fullName.trim(),
        shippingPhone: address.phone.trim(),
        shippingAddressLine: address.addressLine.trim(),
        shippingTown: address.town.trim(),
        paymentMethod: method,
        paymentPhone: paymentMethod === 'card' ? undefined : momoNumber.trim(),
      });
      setOrderNumber(result.order.id.slice(-8).toUpperCase());
      setPaymentNote(
        result.order.simulated
          ? `Payment simulated as ${result.order.paymentStatus} (${formatNgwee(result.order.totalNgwee)}).`
          : result.order.paymentStatus === 'PENDING'
            ? 'Complete the Mobile Money prompt on your phone. We will confirm payment via webhook.'
            : `Total ${formatNgwee(result.order.totalNgwee)}.`,
      );
      setOrderPlaced(true);
      clearCart();
      void refreshCart();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not place order. Sign in and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
      {/* Stepper */}
      <div className="mb-6 flex items-center">
        {STEPS.map((s, i) => {
          const isActive = step === s.key;
          const isDone = STEPS.findIndex((x) => x.key === step) > i;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => (isDone ? goToStep(s.key) : undefined)}
                className="flex flex-col items-center gap-1.5"
                disabled={!isDone && !isActive}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : isDone
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-dim text-graphite-muted'
                  }`}
                >
                  {isDone ? <Check size={16} /> : <s.icon size={16} />}
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-graphite' : 'text-graphite-muted'}`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-primary/40' : 'bg-border-soft'}`} />}
            </div>
          );
        })}
      </div>

      {step === 'address' && (
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-graphite">Delivery address</h2>
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">Full name</span>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                placeholder="e.g. Chanda Mwape"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                placeholder="e.g. 097 000 0000"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">Street address</span>
              <input
                type="text"
                value={address.addressLine}
                onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                placeholder="Plot number, street, area"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">Town / City</span>
              <select
                value={address.town}
                onChange={(e) => setAddress({ ...address, town: e.target.value })}
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
              >
                {['Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe', 'Chipata'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">Delivery notes (optional)</span>
              <textarea
                value={address.notes}
                onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-border-soft px-3.5 py-2.5 text-sm focus:border-primary"
                placeholder="Gate code, landmark, preferred time"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={!addressValid}
            onClick={() => goToStep('payment')}
            className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Continue to payment
          </button>
        </div>
      )}

      {step === 'payment' && (
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-graphite">Payment method</h2>
          <div className="flex flex-col gap-2.5">
            {(
              [
                { key: 'airtel', label: 'Airtel Money', hint: 'Pay via Airtel Money mobile wallet' },
                { key: 'momo', label: 'MTN MoMo', hint: 'Pay via MTN Mobile Money wallet' },
                { key: 'card', label: 'Debit / Credit Card', hint: 'Visa, Mastercard' },
              ] as { key: PaymentMethod; label: string; hint: string }[]
            ).map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                  paymentMethod === opt.key ? 'border-primary bg-primary/5' : 'border-border-soft'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === opt.key}
                  onChange={() => setPaymentMethod(opt.key)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dim">
                  {opt.key === 'card' ? <CreditCard size={16} className="text-graphite" /> : <Smartphone size={16} className="text-graphite" />}
                </span>
                <span>
                  <span className="block text-sm font-medium text-graphite">{opt.label}</span>
                  <span className="block text-xs text-graphite-muted">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {(paymentMethod === 'airtel' || paymentMethod === 'momo') && (
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-graphite-muted">
                {paymentMethod === 'airtel' ? 'Airtel Money number' : 'MTN MoMo number'}
              </span>
              <input
                type="tel"
                inputMode="tel"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                placeholder="e.g. 097 000 0000"
              />
            </label>
          )}

          {paymentMethod === 'card' && (
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Card number"
                className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CVV"
                  className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => goToStep('address')}
              className="flex items-center gap-1 rounded-full border border-border-soft px-4 py-3 text-sm font-semibold text-graphite"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              type="button"
              disabled={!paymentValid}
              onClick={() => goToStep('review')}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Review order
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border-soft bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-graphite">Delivery to</h2>
              <button type="button" onClick={() => goToStep('address')} className="text-xs font-medium text-primary">Edit</button>
            </div>
            <p className="mt-1.5 text-sm text-graphite">{address.fullName} &middot; {address.phone}</p>
            <p className="text-sm text-graphite-muted">{address.addressLine}, {address.town}</p>
          </div>

          <div className="rounded-2xl border border-border-soft bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-graphite">Payment</h2>
              <button type="button" onClick={() => goToStep('payment')} className="text-xs font-medium text-primary">Edit</button>
            </div>
            <p className="mt-1.5 text-sm text-graphite">
              {paymentMethod === 'airtel' && `Airtel Money · ${momoNumber}`}
              {paymentMethod === 'momo' && `MTN MoMo · ${momoNumber}`}
              {paymentMethod === 'card' && 'Debit / Credit Card'}
            </p>
          </div>

          <div className="rounded-2xl border border-border-soft bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-graphite">Order items</h2>
            <div className="flex flex-col gap-3">
              {linesWithProducts.map((line) => (
                <div key={`${line.productId}-${line.color ?? ''}-${line.size ?? ''}`} className="flex items-center gap-3">
                  <ProductImage
                    productId={line.product!.id}
                    categorySlug={line.product!.categorySlug}
                    className="h-12 w-12 shrink-0 rounded-lg"
                    iconClassName="h-1/3 w-1/3"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-graphite">{line.product!.title}</p>
                    <p className="text-xs text-graphite-muted">Qty {line.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-graphite">{formatZmw(line.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-border-soft pt-3 text-sm">
              <div className="flex justify-between text-graphite-muted">
                <span>Subtotal</span>
                <span className="text-graphite">{formatZmw(subtotal)}</span>
              </div>
              <div className="flex justify-between text-graphite-muted">
                <span>Delivery</span>
                <span className="text-graphite">{deliveryEstimate === 0 ? 'Free' : formatZmw(deliveryEstimate)}</span>
              </div>
              <div className="flex justify-between border-t border-border-soft pt-2 text-base font-semibold text-graphite">
                <span>Total</span>
                <span>{formatZmw(total)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handlePlaceOrder()}
            disabled={submitting}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      )}
    </div>
  );
}
