'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/cart-context';
import { useCart } from '@/lib/cart-context';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <p className="text-xs text-gray-500">₺{item.price.toFixed(2)} x {item.quantity}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="text-right min-w-[70px]">
        <p className="font-semibold text-sm">₺{(item.price * item.quantity).toFixed(2)}</p>
      </div>

      <button
        onClick={() => removeItem(item.productId)}
        className="p-1 text-red-400 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
