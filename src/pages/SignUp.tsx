import { Link, useSearchParams } from 'react-router-dom';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Logo } from '../components/common/Logo';
import { clerkAppearance } from '../components/auth/clerkAppearance';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectUrl = safeRedirect(searchParams.get('redirect'));

  if (!hasClerk) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
        <Logo variant="full" className="h-28 w-auto" />
        <h1 className="mt-4 text-xl font-semibold text-graphite">Clerk is not configured</h1>
        <p className="mt-2 text-sm text-graphite-muted">
          Add <code className="rounded bg-surface-dim px-1.5 py-0.5">VITE_CLERK_PUBLISHABLE_KEY</code> to your{' '}
          <code className="rounded bg-surface-dim px-1.5 py-0.5">.env</code> file, then restart the dev server.
        </p>
        <Link to="/" className="mt-6 text-sm font-semibold text-primary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-surface px-4 py-10 sm:px-6">
      <div className="mb-6 shrink-0">
        <Link to="/" aria-label="KeshoGo home">
          <Logo variant="full" className="h-20 w-auto sm:h-24" />
        </Link>
      </div>
      <div className="w-full max-w-[420px]">
        <ClerkSignUp
          routing="path"
          path="/signup"
          signInUrl={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          forceRedirectUrl={redirectUrl}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
