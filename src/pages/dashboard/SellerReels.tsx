import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Clapperboard, Trash2, Upload } from 'lucide-react';
import { sellerApi, type SellerProduct, type SellerReel } from '../../lib/seller-api';
import { useToast } from '../../context/ToastContext';

export function SellerReels() {
  const { showToast } = useToast();
  const [reels, setReels] = useState<SellerReel[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [caption, setCaption] = useState('');
  const [productId, setProductId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const [reelData, productData] = await Promise.all([
      sellerApi.listReels(),
      sellerApi.listProducts(),
    ]);
    setReels(reelData.reels);
    setProducts(productData.products.filter((p) => p.status === 'ACTIVE'));
  }

  useEffect(() => {
    refresh()
      .catch((err) => showToast(err instanceof Error ? err.message : 'Failed to load reels', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('Please choose a video file', 'error');
      return;
    }

    setUploading(true);
    try {
      const { uploadURL, uid, devMode } = await sellerApi.createReelUploadUrl();
      if (uploadURL) {
        const form = new FormData();
        form.append('file', file);
        const put = await fetch(uploadURL, { method: 'POST', body: form });
        if (!put.ok) throw new Error('Video upload to Cloudflare Stream failed');
      } else if (devMode) {
        showToast('Stream not configured — saved with a placeholder UID', 'default');
      }

      await sellerApi.createReel({
        streamUid: uid,
        caption: caption.trim() || undefined,
        productId: productId || undefined,
      });
      setCaption('');
      setProductId('');
      await refresh();
      showToast('Reel published', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    try {
      await sellerApi.deleteReel(id);
      setReels((prev) => prev.filter((r) => r.id !== id));
      showToast('Reel deleted', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-graphite-muted">Loading reels…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-graphite">Reels</h1>
        <p className="text-sm text-graphite-muted">Share short videos with shoppers via Cloudflare Stream.</p>
      </div>

      <div className="mb-8 rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-graphite">Upload a reel</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Caption</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              placeholder="Show what makes this product special"
              className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-graphite-muted">Link a product (optional)</span>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-11 w-full rounded-xl border border-border-soft bg-surface-dim px-4 text-sm"
            >
              <option value="">No product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          >
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Choose video'}
          </button>
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => void handleUpload(e)} />
        </div>
      </div>

      <div className="space-y-3">
        {reels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-soft py-16 text-graphite-muted">
            <Clapperboard size={28} />
            <p className="text-sm">No reels yet — upload your first short video.</p>
          </div>
        ) : (
          reels.map((reel) => (
            <div
              key={reel.id}
              className="flex items-center gap-4 rounded-2xl border border-border-soft bg-white p-4"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-dim">
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Clapperboard size={18} className="text-graphite-muted" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-graphite">{reel.caption || 'Untitled reel'}</p>
                <p className="mt-1 text-xs text-graphite-muted">
                  {reel.likeCount.toLocaleString()} likes · {new Date(reel.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(reel.id)}
                className="rounded-full p-2 text-graphite-muted hover:bg-error/10 hover:text-error"
                aria-label="Delete reel"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
