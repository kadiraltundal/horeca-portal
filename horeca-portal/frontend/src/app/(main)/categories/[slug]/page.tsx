'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Category, Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [params.slug]);

  const loadCategory = async () => {
    try {
      const data = await api.getCategoryBySlug(params.slug as string);
      setCategory(data);
      // Products should be included in category response
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addItem(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Kategoriya topilmadi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{category.nameUz}</h1>
        </div>
      </header>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="px-4 py-3 bg-white border-b">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Alt kategoriyalar</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
              >
                {child.nameUz}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          {products.length} ta mahsulot
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">📦</span>
            <p className="text-gray-500">Bu kategoriyada mahsulotlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-3">
                  <Link href={`/products/${product.id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.nameUz}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.nameUz}
                      </h3>
                    </Link>
                    {product.brand && (
                      <p className="text-xs text-gray-500">{product.brand.name}</p>
                    )}
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {formatPrice(product.pricing?.[0]?.sellingPrice || 0)}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Savatga qo'shish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}