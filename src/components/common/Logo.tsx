interface LogoProps {
  variant?: 'compact' | 'full' | 'mark';
  className?: string;
}

/**
 * variant="compact"  — text wordmark for the nav/header (fits a short bar)
 * variant="full"     — the actual uploaded logo artwork (cart + wordmark + tag),
 *                       for the login/splash screen where vertical space is available
 * variant="mark"     — the cart icon alone, for tight spaces (favicons, tiny chips)
 */
export function Logo({ variant = 'compact', className = '' }: LogoProps) {
  if (variant === 'full') {
    return (
      <img
        src="/logo-full.png"
        alt="KeshoGo"
        className={className}
        width={335}
        height={350}
      />
    );
  }

  if (variant === 'mark') {
    return (
      <img
        src="/logo-mark.png"
        alt=""
        role="presentation"
        className={className}
      />
    );
  }

  return (
    <span className={`font-display font-semibold tracking-tight leading-none ${className}`}>
      {/* This compact wordmark only ever sits on the primary-green header bar,
          so it uses light-on-dark colors rather than the brand's usual dark-on-light pairing. */}
      <span className="text-white">Kesho</span>
      <span className="text-secondary-light">Go</span>
    </span>
  );
}
