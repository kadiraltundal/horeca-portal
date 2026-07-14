'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import Header from '@/components/common/Header';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  sku: string;
  nameUz: string;
  nameRu?: string;
  stockStatus: string;
  isActive: boolean;
  category?: { nameUz: string };
  brand?: { name: string };
  pricing?: { sellingPrice: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);

      const data = await api.get(`/products?${params.toString()}`);
      setProducts(data.items);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mahsulotlar</h2>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Yangi mahsulot
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Mahsulot qidirish..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <Loading text="Yuklanmoqda..." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategoriya</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Narx</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{product.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.nameUz}</p>
                        {product.nameRu && (
                          <p className="text-xs text-gray-500">{product.nameRu}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.category?.nameUz || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatPrice(product.pricing?.[0]?.sellingPrice || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stockStatus === 'in_stock'
                          ? 'bg-green-100 text-green-700'
                          : product.stockStatus === 'out_of_stock'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {product.stockStatus === 'in_stock' ? 'Stokda' :
                         product.stockStatus === 'out_of_stock' ? 'Yo\'q' : 'Cheklangan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Tahrirlash
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}