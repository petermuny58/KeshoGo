/** Default low-stock threshold when a product has no per-variant override. */
export const LOW_STOCK_THRESHOLD = 5;

/** Platform commission rate in basis points (1000 = 10%). */
export const COMMISSION_BPS = 1000;

/** Feature flag — live MoMo/Airtel disbursement is off pre-launch. */
export const PAYOUTS_ENABLED = process.env.PAYOUTS_ENABLED === 'true';
