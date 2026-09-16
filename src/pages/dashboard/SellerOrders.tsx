import { useCallback, useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2 } from 'lucide-react';
import { formatNgwee } from '../../utils/currency';
import { sellerApi, type SellerOrderItem } from '../../lib/seller-api';
import { FulfillmentBadge } from '../../components/dashboard/FulfillmentBadge';
import { useToast } from '../../context/ToastContext';

type StatusTab = 'new' | 'shipped' | 'delivered' | 'cancelled';

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'new', label: 'Pending' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function groupByOrder(items: SellerOrderItem[]) {
  const map = new Map<string, SellerOrderItem[]>();
  for (const item of items) {
    const list = map.get(item.orderId) ?? [];
    list.push(item);
    map.set(item.orderId, list);
  }
  return [...map.entries()].map(([orderId, orderItems]) => ({
    orderId,
    order: orderItems[0].order,
    items: orderItems,
    sellerTotal: orderItems.reduce((s, i) => s + i.lineTotalNgwee, 0),
  }));
}

export function SellerOrders() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<StatusTab>('new');
  const [items, setItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sellerApi.listOrders({ status: activeTab });
      setItems(data.items);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updateStatus(itemId: string, status: string) {
    try {
      await sellerApi.updateItemFulfillment(itemId, status);
      showToast('Order updated', 'success');
      void loadOrders();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  }

  const orders = groupByOrder(items);

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">Orders</h1>
        <p className="text-sm text-graphite-muted">Manage fulfillments and track shipments.</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border-soft">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'text-primary' : 'text-graphite-muted hover:text-graphite'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-graphite-muted">Loading orders…</p>
      ) : (
        <div className="grid gap-4">
          {orders.map(({ orderId, order, items: orderItems, sellerTotal }) => (
            <div key={orderId} className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 border-b border-border-soft pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-graphite">Order #{orderId.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-graphite-muted">
                    Placed {new Date(order.placedAt).toLocaleDateString()} • {order.shippingFullName}
                  </p>
                  <p className="text-xs text-graphite-muted">
                    {order.shippingPhone} • {order.shippingAddressLine}, {order.shippingTown}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-graphite">{formatNgwee(sellerTotal)}</p>
                  <p className="text-xs text-graphite-muted">{orderItems.length} item(s) from your store</p>
                </div>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dim">
                        <Package size={20} className="text-graphite-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-graphite">{item.titleSnapshot}</p>
                        <p className="text-xs text-graphite-muted">
                          Qty: {item.quantity} • {formatNgwee(item.lineTotalNgwee)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FulfillmentBadge status={item.fulfillmentStatus} />
                      {item.fulfillmentStatus === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => void updateStatus(item.id, 'SHIPPED')}
                          className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          <Truck size={14} />
                          Mark Shipped
                        </button>
                      )}
                      {item.fulfillmentStatus === 'SHIPPED' && (
                        <button
                          type="button"
                          onClick={() => void updateStatus(item.id, 'DELIVERED')}
                          className="flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                        >
                          <CheckCircle2 size={14} />
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-12 text-center text-graphite-muted">
              <Package size={40} className="mx-auto mb-3 opacity-50" />
              <p>No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} orders right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
