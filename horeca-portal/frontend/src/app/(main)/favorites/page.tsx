'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

interface Favorite {
  id: string;
  product: Product;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await api.removeFavorite(productId);
      setFavorites(favorites.filter((fav) => fav.product.id !== productId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Sevimlilar</h1>
          <p className="text-sm text-gray-500">{favorites.length} ta mahsulot</p>
        </div>
      </header>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-6xl mb-4">❤️</span>
          <p className="text-gray-500 mb-4">Sevimlilar ro'yxati bo'sh</p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mahsulotlarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <Link href={`/products/${fav.product.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {fav.product.images?.[0] ? (
                      <img
                        src={fav.product.images[0].imageUrl}
                        alt={fav.product.nameUz}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${fav.product.id}`}>
                    <h3 className="font-medium text-gray-900 truncate">
                      {fav.product.nameUz}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">
                    {formatPrice(fav.product.pricing?.[0]?.sellingPrice || 0)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddToCart(fav.product.id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Savatga
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(fav.product.id)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}