import { HTTPException } from 'hono/http-exception';
import type { FulfillmentStatus } from '../../generated/prisma/index.js';

const ALLOWED_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  PENDING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function assertFulfillmentTransition(
  current: FulfillmentStatus,
  next: FulfillmentStatus,
): void {
  if (current === next) return;
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new HTTPException(400, {
      message: `Cannot change fulfillment status from ${current} to ${next}.`,
    });
  }
}
