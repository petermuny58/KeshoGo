import { useEffect, useState } from 'react';
import { formatNgwee } from '../../utils/currency';
import { sellerApi, type EarningsSummary } from '../../lib/seller-api';

interface LedgerEntry {
  id: string;
  type: string;
  amountNgwee: number;
  description: string;
  createdAt: string;
  payoutStatus: string;
}

export function SellerEarnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    sellerApi.getEarnings().then(setSummary).catch(() => {});
    sellerApi.getEarningsHistory().then((r) => setHistory(r.entries as LedgerEntry[])).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-graphite">Earnings</h1>
        <p className="text-sm text-graphite-muted">Your sales, commission, and accruing balance.</p>
      </div>

      {!summary?.payoutsEnabled && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payouts launching soon — your balance is accruing and will be disbursed when we hit scale.
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <p className="text-sm text-graphite-muted">Net balance</p>
          <p className="mt-1 text-2xl font-bold text-graphite">
            {summary ? formatNgwee(summary.netBalanceNgwee) : '—'}
          </p>
          <p className="mt-1 text-xs text-graphite-muted capitalize">{summary?.payoutStatus?.toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <p className="text-sm text-graphite-muted">Gross sales</p>
          <p className="mt-1 text-2xl font-bold text-graphite">
            {summary ? formatNgwee(summary.grossSalesNgwee) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-border-soft bg-white p-5">
          <p className="text-sm text-graphite-muted">This month&apos;s commission</p>
          <p className="mt-1 text-2xl font-bold text-graphite">
            {summary ? formatNgwee(summary.thisMonthCommissionNgwee) : '—'}
          </p>
          <p className="mt-1 text-xs text-graphite-muted">
            {summary ? `${summary.commissionRateBps / 100}% rate` : ''}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft bg-white shadow-sm">
        <div className="border-b border-border-soft px-6 py-4">
          <h2 className="font-semibold text-graphite">Transaction history</h2>
        </div>
        {history.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite-muted">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-surface/50 text-graphite-muted">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-3 text-graphite-muted">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-graphite">{entry.description}</td>
                    <td className="px-6 py-3 text-graphite-muted">{entry.type}</td>
                    <td className={`px-6 py-3 text-right font-medium ${entry.amountNgwee >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatNgwee(entry.amountNgwee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
