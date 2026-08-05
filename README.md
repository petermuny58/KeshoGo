# KeshoGo — Frontend

A responsive e-commerce marketplace frontend for the Zambian market. React 18 + TypeScript + Vite + Tailwind CSS v4 + React Router v6, built entirely on mock data — no backend required.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Resize the window or open dev tools' device toolbar to check the responsive breakpoints (375px, 768px, 1024px, 1440px).

```bash
npm run build      # production build (runs a type check first)
npm run preview    # preview the production build locally
npm run typecheck  # type-check only, no build
```

## What's here

All 13 pages from the brief, wired together with React Router: Home, Category browse + listing, Product detail, Search, Cart, 3-step Checkout, Reels, Trends, Profile (orders/addresses/payment/wishlist/language), Store pages, Create Store, Login, and Sign Up. Cart, wishlist, language, recent searches, and toasts are in-memory React Context — nothing persists across a refresh, by design (no `localStorage`, per the brief).

Sixty mock products across all 15 categories, a dozen mock stores, ten mock Reels, and five hero promotions live in `src/data/`, generated from compact seed arrays rather than hand-written full objects — see `src/data/products.ts` for the pattern if you want to add more.

### A couple of judgment calls worth knowing about

- **No product photography yet.** Rather than faking real photos (which would look like a broken image CDN, or imply sourced product images that don't exist), every product renders as a soft, brand-tinted tile with its category icon (`src/components/product/ProductImage.tsx`, `src/utils/placeholder.ts`). It's deterministic per product, so nothing flickers between renders. Swap in real photography by replacing that one component.
- **The "Glowstore" display font isn't included.** It's a licensed commercial font, so there's no file to ship. `src/index.css` has the `@font-face` rule already wired up and pointed at `public/fonts/Glowstore-Regular.{woff2,woff,ttf}` — drop the licensed files in and it activates automatically, no code changes needed. Until then, it falls back to Poppins (Google Fonts), exactly per the brief's fallback stack.
- **Reels have no real video**, for the same reason as product photos — each card is a placeholder surface with the full interactive chrome (like, share, mute toggle, tappable product tag with a mini add-to-cart card, scroll-snap autoplay simulation via `IntersectionObserver`). Swap in `<video>` elements when there's footage to show.
- **The logo.** Your uploaded artwork had its white background removed (flood-fill + edge cleanup) and lives at `public/logo-full.png` (full lockup, used on the login/signup screens) and `public/logo-mark.png` (cart icon alone). The compact text wordmark used in the header (`src/components/common/Logo.tsx`) is a separate CSS treatment, since the full graphic's tall, vertical composition doesn't fit a short nav bar well at legible size.
- **Login/Sign up are frontend-only forms.** Submitting either just simulates success (toast + redirect home) since there's no auth backend in this pass. Profile shows a mock signed-in user so the account-related pages have something to demonstrate against.
- **Contrast pass.** The burnt-orange brand color (`#FF8313`) is beautiful as a fill with dark text on top, but only clears ~2.5:1 as a foreground color on white or as white-on-orange — both fail WCAG AA. Rather than use it inconsistently, there's a second token, `--color-secondary-ink` (`#B85813`), used specifically where the accent color needs to be a foreground/icon color on a light surface (wishlist heart, discount %, etc.); the raw `secondary` stays for fills and dark-surface contexts where it already tests well. Same story for the star-rating color (`--color-star`) versus the general `--color-warning` token. Worth knowing about if you extend the palette.

### Structure

```
src/
  types/       shared TypeScript types
  data/        mock products, categories, stores, reels, promotions — all seed-generated
  context/     Cart, Wishlist, Language, Toast, SearchHistory (all in-memory)
  utils/       currency formatting, placeholder tint hashing, sort helpers
  components/
    common/    Logo, SearchBar, PromoCarousel, FilterDrawer, DealBadge, StarRating, EmptyState, Toast
    layout/    TopHeader, BottomNav, CategoryMegaMenu, PageShell, HelpFab
    product/   ProductCard, ProductGrid, ProductImage
    reels/     ReelCard
    store/     StoreHeader
  pages/       one file per route
```

### Design tokens

Tailwind v4's CSS-based theme (`src/index.css`, `@theme` block) — brand colors, both fonts, and a breakpoint override (`xl` → 1440px, matching the brief's "large desktop" cutoff; `sm`/`lg` are already Tailwind's defaults of 640/1024). Grid columns follow the brief exactly: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.

The signature "hanging price tag" mark from the logo is rebuilt as an SVG in `DealBadge.tsx` and used for every sale/new/bestseller callout in the product grid, instead of a generic ribbon.

### Known gaps (frontend-only pass, as scoped)

No backend, no real auth, no real payment processing (Mobile Money / card fields are UI-only), no persistence. `npm install` versions are pinned conservatively since this was built without network access to verify against the live npm registry — if a version fails to resolve, `npm install <package>@latest` for that one package should be all it takes.
