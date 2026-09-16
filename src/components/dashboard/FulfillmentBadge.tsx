const STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const LABELS: Record<string, string> = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function FulfillmentBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
