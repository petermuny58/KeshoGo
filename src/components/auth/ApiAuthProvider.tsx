import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ui } from '@clerk/ui';
import { setApiTokenGetter } from '../../lib/api';
import { clerkAppearance } from './clerkAppearance';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function TokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setApiTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      ui={ui}
      appearance={clerkAppearance}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <TokenBridge>{children}</TokenBridge>
    </ClerkProvider>
  );
}
