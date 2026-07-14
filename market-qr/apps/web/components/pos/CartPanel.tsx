'use client';

import { useCart } from '@/lib/cart-context';
import CartItem from './CartItem';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPanel() {
  const { items, subtotal, itemCount, clearCart } = useCart();

  const vatRate = 20;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-primary-600" />
          <h3 className="font-semibold">Satış Listesi</h3>
          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
            {itemCount}
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 p-1"
            title="Sepeti Temizle"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart size={48} className="mb-3 opacity-30" />
            <p className="text-sm">QR kod okutun veya ürün arayın</p>
          </div>
        ) : (
          items.map(item => <CartItem key={item.productId} item={item} />)
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t p-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Ara Toplam</span>
            <span>₺{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>KDV (%{vatRate})</span>
            <span>₺{vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>TOPLAM</span>
            <span className="text-primary-600">₺{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
