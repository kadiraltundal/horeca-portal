'use client';

import { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCart } from '@/lib/cart-context';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  barcode?: string;
  categoryId?: string;
  category?: { id: string; name: string };
}

interface ProductGridProps {
  storeId: string;
  activeCategory: string;
}

export default function ProductGrid({ storeId, activeCategory }: ProductGridProps) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  const loadProducts = async () => {
    try {
      console.log('[ProductGrid] Loading products...');
      const res = await productsApi.search('');
      console.log('[ProductGrid] API response:', res);
      const list = Array.isArray(res) ? res : res.data || res.value || [];
      console.log('[ProductGrid] Parsed products:', list);
      setProducts(list);
    } catch (e) {
      console.error('Product load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === activeCategory);

  const handleAdd = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      barcode: product.barcode,
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-3 bg-slate-50">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
          <Package size={40} strokeWidth={1.5} />
          <p className="text-sm">Ürün bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAdd(product)}
              className="pos-grid-card flex flex-col items-center text-center group"
            >
              <div className="card-image">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <Package size={36} className="text-gray-300 group-hover:text-primary-400 transition-colors" strokeWidth={1.5} />
                )}
              </div>
              <p className="card-name">{product.name}</p>
              <p className="card-price">
                {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </p>
              <div className="card-action">
                <span>
                  <Plus size={10} /> Sepete Ekle
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
