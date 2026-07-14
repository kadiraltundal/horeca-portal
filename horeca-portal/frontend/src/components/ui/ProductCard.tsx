'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export default function ProductCard({ product, layout = 'list' }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id);
  };

  const price = product.pricing?.[0]?.sellingPrice || 0;

  if (layout === 'grid') {
    return (
      <Link
        href={`/products/${product.id}`}
        className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="aspect-square bg-gray-100 relative">
          {product.images?.[0] ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.images[0].altText || product.nameUz}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              📦
            </div>
          )}
          {product.stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Stokda yo'q</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
            {product.nameUz}
          </h3>
          {product.brand && (
            <p className="text-xs text-gray-500 mb-1">{product.brand.name}</p>
          )}
          <p className="text-blue-500 font-bold">${price.toFixed(2)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.images[0].altText || product.nameUz}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              📦
            </div>
          )}
          {product.stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-xs">Yo'q</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.nameUz}</h3>
          {product.brand && (
            <p className="text-xs text-gray-500">{product.brand.name}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-blue-500 font-bold">${price.toFixed(2)}</p>
            <button
              onClick={handleAddToCart}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:bg-blue-700"
            >
              Savatga
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}