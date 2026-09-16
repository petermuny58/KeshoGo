import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ImagePlus, Store, CircleCheck, LogIn, UserPlus } from 'lucide-react';
import { categories } from '../data/categories';
import { sellerApi } from '../lib/seller-api';
import { ApiError } from '../lib/api';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const DRAFT_KEY = 'keshogo:create-store-draft';
const AUTH_REDIRECT = '/create-store?resume=1';

interface StoreDraft {
  storeName: string;
  category: string;
  description: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function saveDraft(draft: StoreDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

function loadDraft(): StoreDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoreDraft;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function AuthPrompt({
  storeName,
  onContinueEditing,
}: {
  storeName: string;
  onContinueEditing: () => void;
}) {
  const loginHref = `/login?redirect=${encodeURIComponent(AUTH_REDIRECT)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(AUTH_REDIRECT)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
        <Store size={28} className="text-primary" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-graphite">
        {storeName.trim() ? `Almost there — claim ${storeName.trim()}` : 'Sign in to create your store'}
      </h1>
      <p className="mt-2 text-sm text-graphite-muted">
        Sign in or create a free account to finish opening your storefront. Your details are saved for this step.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to={signupHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <UserPlus size={18} aria-hidden />
          Create an account
        </Link>
        <Link
          to={loginHref}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border-soft bg-white px-5 py-3 text-sm font-semibold text-graphite hover:bg-surface-dim"
        >
          <LogIn size={18} aria-hidden />
          Sign in
        </Link>
        <button
          type="button"
          onClick={onContinueEditing}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to store details
        </button>
      </div>
    </div>
  );
}

function CreateStoreForm({ isSignedIn }: { isSignedIn: boolean }) {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(categories[0]?.slug ?? '');
  const [description, setDescription] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(isSignedIn);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setStoreName(draft.storeName);
      setCategory(draft.category || categories[0]?.slug || '');
      setDescription(draft.description);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setCheckingExisting(false);
      return;
    }

    let cancelled = false;
    setCheckingExisting(true);
    sellerApi
      .getStore()
      .then(() => {
        if (!cancelled) navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // No store yet — stay on this page
      })
      .finally(() => {
        if (!cancelled) setCheckingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, navigate]);

  async function createStoreFromForm(draft?: StoreDraft) {
    const name = (draft?.storeName ?? storeName).trim();
    const desc = (draft?.description ?? description).trim();
    const cat = draft?.category ?? category;
    const slug = slugify(name);
    if (slug.length < 3) {
      setError('Store name must produce a URL of at least 3 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const store = await sellerApi.createStore({
        name,
        slug,
        description: desc,
        tagline: categories.find((c) => c.slug === cat)?.name,
      });
      clearDraft();
      setStoreName(name);
      setCreatedSlug(store.slug);
      setSubmitted(true);

      if (isSignedIn) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Could not create your store. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // After login/signup return with ?resume=1 and a draft, finish creation automatically
  useEffect(() => {
    if (!isSignedIn || checkingExisting || autoSubmitRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') !== '1') return;

    const draft = loadDraft();
    if (!draft || draft.storeName.trim().length < 3 || draft.description.trim().length < 10) return;

    autoSubmitRef.current = true;
    setStoreName(draft.storeName);
    setCategory(draft.category || categories[0]?.slug || '');
    setDescription(draft.description);
    void createStoreFromForm(draft);
  }, [isSignedIn, checkingExisting]);

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const canSubmit = storeName.trim().length >= 3 && description.trim().length >= 10;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    const draft: StoreDraft = { storeName, category, description };
    saveDraft(draft);

    if (!isSignedIn) {
      setNeedsAuth(true);
      return;
    }

    await createStoreFromForm();
  }

  if (checkingExisting) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center text-sm text-graphite-muted">
        Checking your seller account…
      </div>
    );
  }

  if (needsAuth && !isSignedIn) {
    return (
      <AuthPrompt
        storeName={storeName}
        onContinueEditing={() => setNeedsAuth(false)}
      />
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CircleCheck size={30} className="text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-graphite">{storeName} is live</h1>
        <p className="mt-1.5 text-sm text-graphite-muted">
          Your storefront is ready. Open the seller dashboard to add products and start selling.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Go to dashboard
          </Link>
          {createdSlug && (
            <Link
              to={`/store/${createdSlug}`}
              className="inline-flex items-center justify-center rounded-full border border-border-soft bg-white px-5 py-2.5 text-sm font-semibold text-graphite hover:bg-surface-dim"
            >
              View storefront
            </Link>
          )}
        </div>
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
          <p className="text-sm text-graphite-muted">
            Your store lives inside KeshoGo — same header, cart and checkout shoppers already trust.
          </p>
        </div>
      </div>

      {!isSignedIn && (
        <div className="mb-4 rounded-2xl border border-border-soft bg-white p-4">
          <p className="text-sm text-graphite">
            You can fill in your store details now. We&apos;ll ask you to{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(AUTH_REDIRECT)}`}
              className="font-semibold text-primary hover:underline"
            >
              sign in
            </Link>{' '}
            or{' '}
            <Link
              to={`/signup?redirect=${encodeURIComponent(AUTH_REDIRECT)}`}
              className="font-semibold text-primary hover:underline"
            >
              create an account
            </Link>{' '}
            before we publish it — or do that first if you prefer.
          </p>
        </div>
      )}

      <form className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-white p-5" onSubmit={handleSubmit}>
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
            required
            minLength={3}
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
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
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
            required
            minLength={10}
          />
        </label>

        {error && (
          <p className="rounded-xl bg-error/10 px-3.5 py-2.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="mt-1 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {submitting ? 'Creating…' : isSignedIn ? 'Create store' : 'Continue — sign in to create'}
        </button>
      </form>
    </div>
  );
}

function CreateStoreWithClerk() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center text-sm text-graphite-muted">
        Loading…
      </div>
    );
  }

  return <CreateStoreForm isSignedIn={Boolean(isSignedIn)} />;
}

export function CreateStore() {
  if (!hasClerk) {
    return <CreateStoreForm isSignedIn={false} />;
  }
  return <CreateStoreWithClerk />;
}
