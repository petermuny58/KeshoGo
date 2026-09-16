import { useEffect, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { sellerApi, type CategoryOption, type SellerProduct } from '../../lib/seller-api';
import { useToast } from '../../context/ToastContext';

interface ProductFormModalProps {
  product?: SellerProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [priceZmw, setPriceZmw] = useState(
    product ? String(product.priceNgwee / 100) : '',
  );
  const [sku, setSku] = useState(product?.variants[0]?.sku ?? '');
  const [stock, setStock] = useState(String(product?.variants[0]?.stock ?? 0));
  const [imageUrl, setImageUrl] = useState(product?.images[0]?.url ?? '');
  const [status, setStatus] = useState(product?.status ?? 'DRAFT');

  useEffect(() => {
    sellerApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  async function handleImageUpload(file: File) {
    try {
      const presign = await sellerApi.presignUpload(file.name, file.type, 'products');
      if (presign.uploadUrl) {
        await fetch(presign.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
      }
      setImageUrl(presign.publicUrl);
      showToast('Image uploaded', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const priceNgwee = Math.round(parseFloat(priceZmw) * 100);
      const payload = {
        categoryId,
        title,
        description,
        priceNgwee,
        status,
        images: [{ url: imageUrl, sortOrder: 0 }],
        variants: [
          {
            ...(product?.variants[0]?.id ? { id: product.variants[0].id } : {}),
            sku,
            stock: parseInt(stock, 10),
          },
        ],
      };

      if (product) {
        await sellerApi.updateProduct(product.id, payload);
        showToast('Product updated', 'success');
      } else {
        await sellerApi.createProduct({
          ...payload,
          slug: slugify(title),
        });
        showToast('Product created', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-4">
          <h2 className="text-lg font-semibold text-graphite">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onClose} className="text-graphite-muted hover:text-graphite">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-graphite-muted">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border-soft px-4 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-graphite-muted">Description</span>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border-soft p-4 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-graphite-muted">Category</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft px-3 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-graphite-muted">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE')}
                className="h-11 w-full rounded-xl border border-border-soft px-3 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-graphite-muted">Price (ZMW)</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={priceZmw}
                onChange={(e) => setPriceZmw(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft px-4 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-graphite-muted">SKU</span>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft px-4 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-graphite-muted">Stock</span>
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft px-4 text-sm"
              />
            </label>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-graphite-muted">Image</span>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-dim">
                  <ImagePlus size={20} className="text-graphite-muted" />
                </div>
              )}
              <label className="cursor-pointer rounded-full border border-border-soft px-4 py-2 text-sm font-medium hover:bg-surface-dim">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-graphite-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !imageUrl}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
