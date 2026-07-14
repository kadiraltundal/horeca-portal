'use client';

import { useState } from 'react';
import { Banknote, CreditCard, X, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { ordersApi, paymentsApi } from '@/lib/api';

interface PaymentBarProps {
  storeId: string;
  onOrderComplete: (orderId: string) => void;
}

export default function PaymentBar({ storeId, onOrderComplete }: PaymentBarProps) {
  const { items, subtotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const vatRate = 20;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  const handlePayment = async (method: 'CASH' | 'CARD') => {
    if (items.length === 0 || processing) return;

    setProcessing(true);
    try {
      const order = await ordersApi.create({
        storeId,
        paymentMethod: method,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });

      await paymentsApi.initialize({ orderId: order.id, method });
      await paymentsApi.confirm(order.id);

      clearCart();
      onOrderComplete(order.id);
    } catch (err: any) {
      alert(err.message || 'Ödeme başarısız');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (items.length > 0 && confirm('Satışı iptal etmek istediğinize emin misiniz?')) {
      clearCart();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">Önce ürün ekleyin</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Ödeme Tutarı</span>
            <span className="text-2xl font-bold text-primary-600">₺{total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handlePayment('CASH')}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              {processing ? <Check size={20} className="animate-spin" /> : <Banknote size={20} />}
              Nakit
            </button>

            <button
              onClick={() => handlePayment('CARD')}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {processing ? <Check size={20} className="animate-spin" /> : <CreditCard size={20} />}
              Kart
            </button>

            <button
              onClick={handleCancel}
              disabled={processing}
              className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-lg hover:bg-red-200 font-semibold disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
