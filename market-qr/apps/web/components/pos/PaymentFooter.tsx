'use client';

import { Banknote, CreditCard, Split, Users, MoreHorizontal, Trash2, Receipt } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface PaymentFooterProps {
  onPayment: (method: string) => void;
  onClearCart: () => void;
  discount?: { amount: number; description: string } | null;
}

export default function PaymentFooter({ onPayment, onClearCart, discount }: PaymentFooterProps) {
  const { items, subtotal } = useCart();

  const vat = subtotal * 0.20;
  const discountAmount = discount?.amount || 0;
  const total = subtotal + vat - discountAmount;

  const paymentButtons = [
    {
      label: 'Nakit',
      key: 'F1',
      icon: Banknote,
      method: 'CASH',
      color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    },
    {
      label: 'Kart',
      key: 'F2',
      icon: CreditCard,
      method: 'CREDIT_CARD',
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    {
      label: 'Kısmi',
      key: 'F3',
      icon: Split,
      method: 'PARTIAL',
      color: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    },
    {
      label: 'Cari',
      key: 'F4',
      icon: Users,
      method: 'ACCOUNT',
      color: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
      {/* Summary */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Ara Toplam: <strong className="text-gray-700">{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong></span>
          <span>KDV: <strong className="text-gray-700">{vat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong></span>
          {discountAmount > 0 && (
            <span className="text-red-500 font-semibold">
              İndirim: -{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Toplam</p>
            <p className="text-xl font-extrabold text-gray-900">
              {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Ürün</p>
            <p className="text-lg font-bold text-primary-600">{items.length}</p>
          </div>
        </div>
      </div>

      {/* Payment buttons */}
      <div className="flex items-center gap-2">
        {paymentButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.method}
              onClick={() => items.length > 0 && onPayment(btn.method)}
              disabled={items.length === 0}
              className={`flex-1 bg-gradient-to-r ${btn.color} text-white py-2.5 px-3 rounded-xl font-semibold text-sm
                         flex items-center justify-center gap-2 transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400
                         hover:shadow-lg active:scale-[0.97]`}
            >
              <Icon size={16} />
              <span>{btn.label}</span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">{btn.key}</span>
            </button>
          );
        })}

        {/* Clear cart */}
        <button
          onClick={onClearCart}
          disabled={items.length === 0}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                     text-white py-2.5 px-4 rounded-xl font-semibold text-sm
                     flex items-center justify-center gap-2 transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-lg active:scale-[0.97]"
        >
          <Trash2 size={16} />
          <span>İptal</span>
          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">F5</span>
        </button>
      </div>
    </div>
  );
}
