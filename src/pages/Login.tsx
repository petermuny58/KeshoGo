import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { Logo } from '../components/common/Logo';
import { clerkAppearance } from '../components/auth/clerkAppearance';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.CLERK_PUBLISHABLE_KEY);

export function Login() {
  if (!hasClerk) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh_-_64px)] max-w-sm flex-col items-center justify-center px-6 py-10 text-center">
        <Logo variant="full" className="h-32 w-auto" />
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10">
      <Logo variant="full" className="mb-6 h-28 w-auto" />
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        forceRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </div>
  );
}
