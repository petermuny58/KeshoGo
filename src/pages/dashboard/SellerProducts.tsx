import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatNgwee } from '../../utils/currency';
import { sellerApi, type SellerProduct } from '../../lib/seller-api';
import { ProductFormModal } from '../../components/dashboard/ProductFormModal';
import { useToast } from '../../context/ToastContext';

export function SellerProducts() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SellerProduct | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sellerApi.listProducts({ search: searchTerm || undefined });
      setProducts(data.products);
      setLowStockThreshold(data.lowStockThreshold);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => void loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  async function handleDelete(id: string) {
    if (!confirm('Archive this product?')) return;
    try {
      await sellerApi.deleteProduct(id);
      showToast('Product archived', 'success');
      void loadProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Products</h1>
          <p className="text-sm text-graphite-muted">Manage your store&apos;s inventory and listings.</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="rounded-2xl border border-border-soft bg-white shadow-sm">
        <div className="border-b border-border-soft p-4">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-full border border-border-soft bg-surface-dim pl-10 pr-4 text-sm focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-graphite-muted">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite-muted">No products yet. Add your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-surface/50 text-graphite-muted">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {products.map((product) => {
                  const totalStock = product.totalStock ?? product.variants.reduce((s, v) => s + v.stock, 0);
                  const isLow = product.isLowStock ?? totalStock <= lowStockThreshold;
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-surface-dim/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {product.images[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg border border-border-soft object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-surface-dim" />
                          )}
                          <div>
                            <p className="font-medium text-graphite">{product.title}</p>
                            <p className="text-xs text-graphite-muted">SKU: {product.variants[0]?.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-graphite">
                        {totalStock > 0 ? (
                          <span className="flex items-center gap-1.5">
                            {isLow && <AlertTriangle size={14} className="text-orange-500" />}
                            <span className={isLow ? 'font-medium text-orange-600' : ''}>
                              {totalStock} in stock
                            </span>
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">Out of stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-graphite">
                        {formatNgwee(product.priceNgwee)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditing(product); setShowForm(true); }}
                            className="p-2 text-graphite-muted hover:text-primary"
                            aria-label="Edit product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(product.id)}
                            className="p-2 text-graphite-muted hover:text-red-600"
                            aria-label="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => void loadProducts()}
        />
      )}
    </div>
  );
}
