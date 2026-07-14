'use client';

import { useState } from 'react';
import { X, Banknote, CreditCard, Check, Loader2 } from 'lucide-react';
import { ordersApi, paymentsApi } from '@/lib/api';
import { useCart } from '@/lib/cart-context';

interface PaymentModalProps {
  method: string;
  storeId: string;
  onClose: () => void;
  onComplete: (orderId: string) => void;
}

export default function PaymentModal({ method, storeId, onClose, onComplete }: PaymentModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [error, setError] = useState('');

  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  const methodLabels: Record<string, { label: string; icon: typeof Banknote; color: string }> = {
    CASH: { label: 'Nakit Satış', icon: Banknote, color: 'text-green-600' },
    CREDIT_CARD: { label: 'Pos Kart Satış', icon: CreditCard, color: 'text-blue-600' },
    PARTIAL: { label: 'Kısmi Ödeme', icon: CreditCard, color: 'text-yellow-600' },
    ACCOUNT: { label: 'Cari Satış', icon: CreditCard, color: 'text-orange-600' },
    OTHER: { label: 'Diğer Ödeme', icon: CreditCard, color: 'text-gray-600' },
  };

  const info = methodLabels[method] || methodLabels.OTHER;
  const Icon = info.icon;

  const handlePay = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    setError('');

    try {
      const order = await ordersApi.create({
        storeId,
        paymentMethod: method,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });

      await paymentsApi.initialize({ orderId: order.id, method });
      await paymentsApi.confirm(order.id);

      clearCart();
      onComplete(order.id);
    } catch (e: any) {
      setError(e.message || 'Ödeme hatası');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${info.color}`}>
              <Icon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{info.label}</h2>
              <p className="text-xs text-gray-500">Ödeme onayı</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Amount display */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Ödenecek Tutar</p>
            <p className="text-3xl font-bold text-gray-900">
              {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
          </div>

          {/* Cash input (for CASH method) */}
          {method === 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alınan Tutar</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={total.toFixed(2)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-primary-500 outline-none"
                autoFocus
              />
              {paidAmount && Number(paidAmount) >= total && (
                <p className="text-sm text-green-600 mt-1 text-center">
                  Para Üstü: {(Number(paidAmount) - total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </p>
              )}
            </div>
          )}

          {/* Order summary */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>KDV (%20)</span>
              <span>{vat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t">
              <span>Toplam</span>
              <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 h-12 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handlePay}
            disabled={processing || items.length === 0}
            className="flex-1 h-12 rounded-lg bg-pos-success text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Check size={18} />
                Ödemeyi Onayla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
