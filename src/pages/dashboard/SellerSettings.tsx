import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { ImagePlus, Store } from 'lucide-react';
import { sellerApi } from '../../lib/seller-api';
import { useToast } from '../../context/ToastContext';

import { ApiError } from '../../lib/api';
import { Link } from 'react-router-dom';

interface StoreProfile {
  name: string;
  tagline: string | null;
  description: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  pacraNumber: string | null;
  tpin: string | null;
  payoutPhone: string | null;
  payoutMethod: string | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export function SellerSettings() {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [pacraNumber, setPacraNumber] = useState('');
  const [tpin, setTpin] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('MTN_MOMO');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<StoreProfile['status']>('PENDING');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noStore, setNoStore] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sellerApi
      .getProfile()
      .then((profile: StoreProfile) => {
        setStoreName(profile.name);
        setTagline(profile.tagline ?? '');
        setDescription(profile.description ?? '');
        setPacraNumber(profile.pacraNumber ?? '');
        setTpin(profile.tpin ?? '');
        setPayoutPhone(profile.payoutPhone ?? '');
        setPayoutMethod(profile.payoutMethod ?? 'MTN_MOMO');
        setBannerPreview(profile.bannerUrl);
        setBannerUrl(profile.bannerUrl);
        setStatus(profile.status);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setNoStore(true);
        } else {
          showToast('Could not load store profile', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  async function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const presign = await sellerApi.presignUpload(file.name, file.type, 'store');
      if (presign.uploadUrl) {
        const put = await fetch(presign.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!put.ok) throw new Error('Banner upload failed. Check R2 configuration.');
      } else if (presign.devMode) {
        showToast('R2 not configured — using placeholder banner URL', 'default');
      }
      setBannerPreview(presign.publicUrl);
      setBannerUrl(presign.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Banner upload failed';
      if (msg.includes('Failed to fetch') || msg.includes('CORS') || err instanceof TypeError) {
        showToast('Banner upload blocked by Cloudflare R2 CORS policy. Set CORS origins on your R2 bucket.', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setUploadingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!bannerUrl || !/^https?:\/\//i.test(bannerUrl)) {
      showToast('Upload a store banner before saving', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await sellerApi.updateProfile({
        name: storeName,
        tagline,
        description,
        bannerUrl,
        pacraNumber: pacraNumber || undefined,
        tpin: tpin || undefined,
        payoutPhone: payoutPhone || undefined,
        payoutMethod,
      });
      setStatus(updated.status);
      showToast(
        updated.status === 'ACTIVE'
          ? 'Settings saved — your store is live and searchable'
          : 'Settings saved — add payout details and a banner to go live',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md p-6 lg:p-8 text-center text-sm text-graphite-muted">
        Loading store settings…
      </div>
    );
  }

  if (noStore) {
    return (
      <div className="mx-auto max-w-md p-6 lg:p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Store size={28} className="text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-graphite">No Store Found</h1>
        <p className="mt-2 text-sm text-graphite-muted">
          You haven&apos;t opened a store on KeshoGo yet. Create a store first to access your seller settings.
        </p>
        <Link
          to="/create-store"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Open Your Store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Store Settings</h1>
          <p className="text-sm text-graphite-muted">Update your store&apos;s public profile and payout details.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === 'ACTIVE'
              ? 'bg-primary/10 text-primary'
              : status === 'SUSPENDED'
                ? 'bg-error/10 text-error'
                : 'bg-surface-dim text-graphite-muted'
          }`}
        >
          {status === 'ACTIVE' ? 'Live & searchable' : status === 'SUSPENDED' ? 'Suspended' : 'Pending — complete profile to go live'}
        </span>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-graphite">Store Banner</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingBanner}
            className="group relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border-soft bg-surface-dim transition-colors hover:bg-surface-dim/80 disabled:opacity-60"
          >
            {bannerPreview ? (
              <>
                <img src={bannerPreview} alt="Store banner preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                    <ImagePlus size={18} />
                    {uploadingBanner ? 'Uploading…' : 'Change Banner'}
                  </span>
                </div>
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 text-graphite-muted">
                <ImagePlus size={24} />
                <span className="text-sm font-medium">{uploadingBanner ? 'Uploading…' : 'Upload a store banner'}</span>
              </span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => void handleBannerChange(e)} className="hidden" />
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Store size={20} className="text-graphite-muted" />
            <h2 className="text-lg font-semibold text-graphite">Basic Details</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Store Name</span>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm text-graphite focus:border-primary focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Tagline</span>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm text-graphite focus:border-primary focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">About Store</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border-soft bg-surface-dim p-4 text-sm text-graphite focus:border-primary focus:bg-white"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-graphite">Business &amp; Payout</h2>
          <p className="mb-4 text-sm text-graphite-muted">
            Required to go live: payout phone + method, plus a banner. PACRA and TPIN are optional.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">PACRA Number (optional)</span>
              <input
                type="text"
                value={pacraNumber}
                onChange={(e) => setPacraNumber(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">TPIN (optional)</span>
              <input
                type="text"
                value={tpin}
                onChange={(e) => setTpin(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Payout Phone</span>
              <input
                type="tel"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Payout Method</span>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
              >
                <option value="MTN_MOMO">MTN MoMo</option>
                <option value="AIRTEL_MONEY">Airtel Money</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || uploadingBanner}
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
