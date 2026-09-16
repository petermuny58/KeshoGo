import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, Banknote, ArrowRight, Store, AlertTriangle } from 'lucide-react';
import { formatNgwee } from '../../utils/currency';
import { sellerApi, type OverviewStats } from '../../lib/seller-api';

export function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    sellerApi.getOverview().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-graphite">Dashboard</h1>
        <p className="text-sm text-graphite-muted">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-border-soft bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Banknote size={20} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-graphite-muted">Today&apos;s Sales</p>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-graphite">
              {stats ? formatNgwee(stats.todaySalesNgwee) : '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border-soft bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-graphite-muted">Pending Orders</p>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-graphite">{stats?.pendingOrderCount ?? '—'}</p>
            <Link to="/dashboard/orders" className="mt-1 flex items-center text-xs font-medium text-primary hover:underline">
              View orders <ArrowRight size={12} className="ml-0.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border-soft bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
              <Package size={20} className="text-orange-600" />
            </div>
            <p className="text-sm font-medium text-graphite-muted">Low Stock</p>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-graphite">{stats?.lowStockProductCount ?? '—'}</p>
            {(stats?.lowStockProductCount ?? 0) > 0 && (
              <Link
                to="/dashboard/products"
                className="mt-1 flex items-center text-xs font-medium text-orange-600 hover:underline"
              >
                <AlertTriangle size={12} className="mr-1" />
                Restock needed
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-soft bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-graphite">Quick Actions</h2>
          </div>
          <div className="grid gap-3">
            <Link
              to="/dashboard/products"
              className="flex items-center gap-3 rounded-xl border border-border-soft p-4 transition-colors hover:bg-surface-dim"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-graphite">Add new product</p>
                <p className="text-xs text-graphite-muted">List a new item in your store</p>
              </div>
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center gap-3 rounded-xl border border-border-soft p-4 transition-colors hover:bg-surface-dim"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-graphite">Unfulfilled orders</p>
                <p className="text-xs text-graphite-muted">
                  {stats?.pendingOrderCount ?? 0} waiting for shipment
                </p>
              </div>
            </Link>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl border border-border-soft p-4 transition-colors hover:bg-surface-dim"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Store size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-graphite">Store settings</p>
                <p className="text-xs text-graphite-muted">Update your banner and description</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-graphite">Earnings</h2>
            <Link to="/dashboard/earnings" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border-soft bg-surface-dim">
            <TrendingUp size={28} className="mb-2 text-graphite-muted opacity-50" />
            <p className="text-sm text-graphite-muted">Track balance and commission on the Earnings page</p>
          </div>
        </div>
      </div>
    </div>
  );
}
