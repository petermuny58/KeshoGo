import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNgwee } from '../../utils/currency';
import { sellerApi } from '../../lib/seller-api';

export function SellerAnalytics() {
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('6m');
  const [data, setData] = useState<{
    profitSeries: { month: string; profitNgwee: number }[];
    buyerSeries: { month: string; buyerCount: number }[];
    topProducts: { title: string; units: number; revenueNgwee: number }[];
  } | null>(null);

  useEffect(() => {
    sellerApi.getAnalytics(range).then(setData).catch(() => {});
  }, [range]);

  const profitChart = data?.profitSeries.map((d) => ({
    month: d.month,
    profit: d.profitNgwee / 100,
  })) ?? [];

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Analytics</h1>
          <p className="text-sm text-graphite-muted">Sales trends and top products.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '3m' | '6m' | '12m')}
          className="h-10 rounded-xl border border-border-soft px-3 text-sm"
        >
          <option value="3m">Last 3 months</option>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <h2 className="mb-4 font-semibold text-graphite">Monthly profit (ZMW)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#e85d04" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <h2 className="mb-4 font-semibold text-graphite">Unique buyers per month</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.buyerSeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="buyerCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft bg-white p-5">
        <h2 className="mb-4 font-semibold text-graphite">Top-selling products</h2>
        {data?.topProducts.length === 0 ? (
          <p className="text-sm text-graphite-muted">No sales data for this period.</p>
        ) : (
          <ol className="space-y-3">
            {data?.topProducts.map((p, i) => (
              <li key={p.title} className="flex items-center justify-between rounded-xl bg-surface-dim px-4 py-3">
                <span className="text-sm text-graphite">
                  <span className="mr-2 font-semibold text-graphite-muted">{i + 1}.</span>
                  {p.title}
                </span>
                <span className="text-sm font-medium text-graphite">
                  {p.units} sold • {formatNgwee(p.revenueNgwee)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
