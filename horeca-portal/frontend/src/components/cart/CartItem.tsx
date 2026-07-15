'use client';

import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCartStore();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(item.id);
    } else {
      await updateItem(item.id, newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
          {item.product?.images?.[0] ? (
            <img
              src={item.product.images[0].imageUrl}
              alt={item.product.nameUz}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              📦
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 truncate">
              {item.product?.nameUz || 'Mahsulot'}
            </h3>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} / dona</p>
          <p className="text-sm font-medium text-blue-600 mt-1">
            {formatPrice(item.totalPrice)}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300"
          >
            +
          </button>
        </div>

        {/* Note */}
        {item.note && (
          <p className="text-xs text-gray-500 truncate max-w-[150px]">
            📝 {item.note}
          </p>
        )}
      </div>
    </div>
  );
}