'use client';

import { Package, Trash2, ShoppingCart } from 'lucide-react';
import { useCart, CartItem } from '@/lib/cart-context';
import QuantityControl from './QuantityControl';

interface ProductTableProps {
  onProductSelect?: (productId: string, productName: string) => void;
  selectedProductId?: string | null;
}

export default function ProductTable({ onProductSelect, selectedProductId }: ProductTableProps) {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 p-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingCart size={36} strokeWidth={1.5} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">Sepet boş</p>
          <p className="text-xs text-gray-300 mt-1">Ürün eklemek için karta tıklayın veya barkod taratın</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-primary-500" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Sepet</span>
        </div>
        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {items.length} ürün
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {items.map((item, index) => (
          <ProductRow
            key={item.productId}
            item={item}
            index={index + 1}
            isSelected={selectedProductId === item.productId}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onSelect={onProductSelect}
          />
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  item,
  index,
  isSelected,
  onUpdateQuantity,
  onRemove,
  onSelect,
}: {
  item: CartItem;
  index: number;
  isSelected: boolean;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSelect?: (id: string, name: string) => void;
}) {
  const total = item.price * item.quantity;

  return (
    <div
      onClick={() => onSelect?.(item.productId, item.name)}
      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'bg-primary-50 border border-primary-200 shadow-sm'
          : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      {/* Product Image */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain" />
        ) : (
          <Package size={18} className="text-gray-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400">{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ x {item.quantity}</span>
        </div>
      </div>

      {/* Quantity */}
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <QuantityControl
          quantity={item.quantity}
          onChange={(qty) => onUpdateQuantity(item.productId, qty)}
        />
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0 w-20">
        <p className="text-sm font-bold text-gray-900">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
      </div>

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.productId); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Sepetten çıkar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
