'use client';

import { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';
import { productsApi } from '@/lib/api';

interface StoreProduct {
  id: string;
  stockQuantity: number;
  shelfNumber?: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    barcode?: string;
    category?: { id: string; name: string };
  };
}

interface ProductsPageProps {
  storeId: string;
}

export default function ProductsPage({ storeId }: ProductsPageProps) {
  const [items, setItems] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  const loadProducts = async () => {
    try {
      const res = await productsApi.listByStore(storeId);
      const list = Array.isArray(res) ? res : res.data || res.value || [];
      setItems(list);
    } catch (e) {
      console.error('Products load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(item => {
    const p = item.product;
    if (!p) return false;
    return (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Ürünler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-xl shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Package size={20} />
          Ürünler ({items.length})
        </h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600">Ürün Adı</th>
              <th className="text-left p-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left p-3 font-semibold text-gray-600">Barkod</th>
              <th className="text-left p-3 font-semibold text-gray-600">Kategori</th>
              <th className="text-right p-3 font-semibold text-gray-600">Fiyat</th>
              <th className="text-right p-3 font-semibold text-gray-600">Stok</th>
              <th className="text-left p-3 font-semibold text-gray-600">Raf</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const p = item.product;
              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p?.name}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{p?.sku}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{p?.barcode || '-'}</td>
                  <td className="p-3 text-gray-500">{p?.category?.name || '-'}</td>
                  <td className="p-3 text-right font-semibold text-primary-600">
                    {p?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.stockQuantity > 10 ? 'bg-green-100 text-green-700' :
                      item.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.stockQuantity}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{item.shelfNumber || '-'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Ürün bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
