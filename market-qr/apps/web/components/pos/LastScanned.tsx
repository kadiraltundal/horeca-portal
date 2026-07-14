'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

interface LastScannedProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    barcode?: string;
  };
  stockQuantity: number;
}

export default function LastScanned({ product, stockQuantity }: LastScannedProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-500">Son Taranan</span>
      </div>

      <div className="flex gap-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{product.name}</p>
          {product.description && (
            <p className="text-xs text-gray-500 truncate">{product.description}</p>
          )}
          <p className="text-xl font-bold text-primary-600 mt-1">₺{product.price.toFixed(2)}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Stok: {stockQuantity}
            </span>
            {product.barcode && (
              <span className="text-xs text-gray-400">{product.barcode}</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={stockQuantity <= 0}
        className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
          added
            ? 'bg-green-500 text-white'
            : stockQuantity > 0
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {added ? <><Check size={18} /> Eklendi!</> : <><ShoppingCart size={18} /> Sepete Ekle</>}
      </button>
    </div>
  );
}
