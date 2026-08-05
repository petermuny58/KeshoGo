import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  UserCircle2, Package, MapPin, CreditCard, Heart, Languages, Store,
  ChevronRight, Check, Plus, LogOut,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { products } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { formatZmw } from '../utils/currency';
import type { LanguageCode } from '../types';

type Tab = 'orders' | 'addresses' | 'payment' | 'wishlist' | 'language';

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'language', label: 'Language', icon: Languages },
];

const MOCK_ORDERS = [
  { id: '482913', date: 'Aug 1, 2026', status: 'Delivered', items: 3, total: 680 },
  { id: '481022', date: 'Jul 24, 2026', status: 'Processing', items: 1, total: 4200 },
  { id: '479887', date: 'Jul 10, 2026', status: 'Delivered', items: 2, total: 350 },
];

const MOCK_ADDRESSES = [
  { label: 'Home', name: 'Chanda Mwape', detail: 'Plot 45, Kabulonga Road, Lusaka', isDefault: true },
  { label: 'Work', name: 'Chanda Mwape', detail: 'ZamCom Building, Cairo Road, Lusaka', isDefault: false },
];

const MOCK_PAYMENT_METHODS = [
  { label: 'MTN MoMo', detail: '•••• •••• 4821', kind: 'momo' as const },
  { label: 'Airtel Money', detail: '•••• •••• 7734', kind: 'airtel' as const },
];

export function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'orders';
  const { wishlistIds } = useWishlist();
  const { language, availableLanguages, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  function setTab(tab: Tab) {
    setSearchParams({ tab });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3.5 rounded-2xl border border-border-soft bg-white p-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <UserCircle2 size={30} className="text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-graphite">Chanda Mwape</p>
          <p className="text-sm text-graphite-muted">+260 97 000 0000</p>
        </div>
        <button
          type="button"
          onClick={() => showToast('Signed out')}
          aria-label="Sign out"
          className="rounded-full p-2 text-graphite-muted hover:bg-surface-dim"
        >
          <LogOut size={18} />
        </button>
      </div>

      <Link
        to="/create-store"
        className="mt-3 flex items-center gap-3 rounded-2xl bg-primary p-4 text-white transition-colors hover:bg-primary-dark"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Store size={20} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Open your own store</span>
          <span className="block text-xs text-white/80">Start selling to shoppers across Zambia — free to start</span>
        </span>
        <ChevronRight size={18} />
      </Link>

      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            aria-pressed={activeTab === tab.key}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-primary bg-primary text-white'
                : 'border-border-soft text-graphite hover:bg-surface-dim'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.key === 'wishlist' && wishlistIds.length > 0 && (
              <span className="ml-0.5 rounded-full bg-secondary px-1.5 text-[10px] font-bold text-graphite">
                {wishlistIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 pb-8">
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-3">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-border-soft bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-graphite">Order #{order.id}</p>
                  <p className="text-xs text-graphite-muted">{order.date} &middot; {order.items} item{order.items > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-graphite">{formatZmw(order.total)}</p>
                  {order.status === 'Delivered' ? (
                    <span className="text-xs font-medium text-primary">{order.status}</span>
                  ) : (
                    <span className="rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-graphite">{order.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="flex flex-col gap-3">
            {MOCK_ADDRESSES.map((addr) => (
              <div key={addr.label} className="flex items-start gap-3 rounded-2xl border border-border-soft bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-dim">
                  <MapPin size={16} className="text-primary" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-graphite">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-graphite-muted">{addr.name}</p>
                  <p className="text-sm text-graphite-muted">{addr.detail}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => showToast('Add address form coming soon')}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-soft py-3.5 text-sm font-medium text-graphite-muted hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
              Add new address
            </button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="flex flex-col gap-3">
            {MOCK_PAYMENT_METHODS.map((pm) => (
              <div key={pm.label} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-dim">
                  <CreditCard size={16} className="text-primary" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-graphite">{pm.label}</p>
                  <p className="text-sm text-graphite-muted">{pm.detail}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => showToast('Add payment method form coming soon')}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border-soft py-3.5 text-sm font-medium text-graphite-muted hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
              Add payment method
            </button>
          </div>
        )}

        {activeTab === 'wishlist' && <ProductGrid products={wishlistProducts} emptyTitle="Your wishlist is empty" emptyDescription="Tap the heart on any product to save it here for later." />}

        {activeTab === 'language' && (
          <div className="flex flex-col gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                disabled={!lang.enabled}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  showToast(`Language set to ${lang.label}`, 'success');
                }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  language === lang.code ? 'border-primary bg-primary/5' : 'border-border-soft'
                } ${!lang.enabled ? 'opacity-50' : 'hover:bg-surface-dim'}`}
              >
                <span>
                  <span className="block text-sm font-medium text-graphite">{lang.label}</span>
                  <span className="block text-xs text-graphite-muted">{lang.nativeLabel}</span>
                </span>
                {language === lang.code ? (
                  <Check size={18} className="text-primary" />
                ) : !lang.enabled ? (
                  <span className="text-xs font-medium text-graphite-muted">Coming soon</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
