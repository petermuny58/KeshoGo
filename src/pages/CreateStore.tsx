import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Store, CircleCheck } from 'lucide-react';
import { categories } from '../data/categories';

export function CreateStore() {
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(categories[0].slug);
  const [description, setDescription] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const canSubmit = storeName.trim().length >= 3 && description.trim().length >= 10;

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CircleCheck size={30} className="text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-graphite">{storeName} is live</h1>
        <p className="mt-1.5 text-sm text-graphite-muted">
          Your storefront has been created inside KeshoGo. Head to your profile to start adding products.
        </p>
        <Link to="/profile" className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Go to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Store size={20} className="text-primary" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-graphite">Open your store</h1>
          <p className="text-sm text-graphite-muted">Your store lives inside KeshoGo — same header, cart and checkout shoppers already trust.</p>
        </div>
      </div>

      <form
        className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) setSubmitted(true);
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border-soft bg-surface-dim"
        >
          {bannerPreview ? (
            <img src={bannerPreview} alt="Store banner preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-graphite-muted">
              <ImagePlus size={22} />
              <span className="text-sm font-medium">Add a store banner</span>
            </span>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Store name</span>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Mwansa's Electronics"
            className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Primary category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-xl border border-border-soft px-3.5 text-sm focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Tell shoppers about your store</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What do you sell, and what makes it worth buying from you?"
            className="w-full rounded-xl border border-border-soft px-3.5 py-2.5 text-sm focus:border-primary"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Create store
        </button>
      </form>
    </div>
  );
}
