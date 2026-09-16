import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { AppUserButton } from './AppUserButton';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  if (!hasClerk) return null;

  return (
    <>
      <SignedOut>
        <Link
          to="/login"
          className="rounded-full px-2.5 py-2 text-xs font-medium text-white/95 transition-colors hover:bg-white/10 sm:px-3 sm:text-sm lg:inline-flex"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="rounded-full bg-white/15 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25 sm:px-3 sm:text-sm lg:inline-flex"
        >
          Sign up
        </Link>
      </SignedOut>
      <SignedIn>
        <AppUserButton />
      </SignedIn>
    </>
  );
}
