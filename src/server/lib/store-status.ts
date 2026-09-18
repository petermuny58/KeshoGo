/** A store is searchable once profile essentials are filled in. */
export function isStoreReadyToGoLive(store: {
  name: string;
  bannerUrl: string | null | undefined;
  payoutPhone: string | null | undefined;
  payoutMethod: string | null | undefined;
}): boolean {
  const hasName = store.name.trim().length >= 3;
  const hasBanner = Boolean(store.bannerUrl?.trim());
  const hasPayout = Boolean(store.payoutPhone?.trim()) && Boolean(store.payoutMethod);
  return hasName && hasBanner && hasPayout;
}

/** Never auto-unsuspend; otherwise ACTIVE when ready, else PENDING. */
export function resolveStoreStatusAfterProfileUpdate(merged: {
  name: string;
  bannerUrl: string | null | undefined;
  payoutPhone: string | null | undefined;
  payoutMethod: string | null | undefined;
  status: string;
}): 'ACTIVE' | 'PENDING' | 'SUSPENDED' {
  if (merged.status === 'SUSPENDED') return 'SUSPENDED';
  return isStoreReadyToGoLive(merged) ? 'ACTIVE' : 'PENDING';
}
