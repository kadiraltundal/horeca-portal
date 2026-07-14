'use client';

import { useState } from 'react';
import { Search, Barcode, Keyboard } from 'lucide-react';
import { productsApi } from '@/lib/api';

interface ProductSearchProps {
  storeId: string;
  onProductFound: (product: any) => void;
}

export default function ProductSearch({ storeId, onProductFound }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await productsApi.search(query.trim());
      if (result.data && result.data.length > 0) {
        const product = result.data[0];
        onProductFound({
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            barcode: product.barcode,
            imageUrl: product.imageUrl,
          },
          store: { id: storeId },
          storeProduct: { stockQuantity: product.stockQuantity || 0 },
        });
        setQuery('');
      } else {
        setError('Ürün bulunamadı');
      }
    } catch {
      setError('Arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcode = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const product = await productsApi.findByBarcode(query.trim());
      onProductFound({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          barcode: product.barcode,
          imageUrl: product.imageUrl,
        },
        store: { id: storeId },
        storeProduct: { stockQuantity: 0 },
      });
      setQuery('');
    } catch {
      setError('Barkod ile ürün bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard size={20} className="text-primary-600" />
        <h3 className="font-semibold">Ürün Ara / Barkod</h3>
      </div>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ürün adı veya barkod..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-2">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
        >
          <Search size={16} />
          Ara
        </button>
        <button
          onClick={handleBarcode}
          disabled={loading || !query.trim()}
          className="flex-1 flex items-center justify-center gap-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 text-sm disabled:opacity-50"
        >
          <Barcode size={16} />
          Barkod
        </button>
      </div>
    </div>
  );
}
