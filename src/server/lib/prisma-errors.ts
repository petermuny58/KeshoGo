/**
 * Prisma error objects carry a `.code` string (e.g. "P2002" for a unique
 * constraint violation) regardless of exact class/export shape, which has
 * been stable across Prisma's Rust-engine and newer TypeScript-native
 * clients alike. Checking structurally here, rather than an `instanceof`
 * against a specific error class export, means this keeps working even if
 * that export path shifts between Prisma versions.
 */
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'P2002'
  );
}

export function uniqueConstraintTarget(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null || !('meta' in err)) return undefined;
  const meta = (err as { meta?: unknown }).meta;
  if (typeof meta !== 'object' || meta === null || !('target' in meta)) return undefined;
  const target = (meta as { target?: unknown }).target;
  return Array.isArray(target) ? target.join(', ') : undefined;
}
