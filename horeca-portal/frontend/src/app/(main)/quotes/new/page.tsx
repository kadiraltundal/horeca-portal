'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';
import { useTelegram } from '@/hooks/useTelegram';
import Header from '@/components/common/Header';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function NewQuotePage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { showMainButton, hideMainButton, sendMainButtonClicked } = useTelegram();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');

  useEffect(() => {
    showMainButton('✅ Teklifni tasdiqlash');
    sendMainButtonClicked(handleSubmit);
    return () => hideMainButton();
  }, []);

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert('Savatingiz bo\'sh');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createQuote(note || undefined);
      setQuoteNumber(result.quoteNumber);
      setSuccess(true);
      await clearCart();
    } catch (error) {
      console.error('Failed to create quote:', error);
      alert('Teklif yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Teklif muvaffaqiyatli yuborildi!
          </h1>
          <p className="text-gray-500 mb-4">
            Teklif raqamingiz:
          </p>
          <div className="bg-white px-6 py-3 rounded-xl shadow-sm inline-block mb-6">
            <p className="text-xl font-bold text-blue-600">#{quoteNumber}</p>
          </div>
          <p className="text-gray-500 mb-8">
            Kalsan siz bilan tez orada bog&apos;lanadi
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/quotes')}
              fullWidth
            >
              Tekliflarni ko&apos;rish
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="secondary"
              fullWidth
            >
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Teklif Yuborish" showBackButton />

      <div className="px-4 py-4 space-y-4">
        {/* Quote Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Teklif ma&apos;lumotlari</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
              <p className="text-sm text-gray-500">Mahsulot</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatPrice(getTotal())}</p>
              <p className="text-sm text-gray-500">Jami summa</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Teklif ro&apos;yxati</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0].imageUrl}
                      alt={item.product.nameUz}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.product?.nameUz || 'Mahsulot'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Note */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Qo&apos;shimcha ma&apos;lumot</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Teklif haqida qo'shimcha ma'lumot yozing (ixtiyoriy)..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-2 text-right">
            {note.length}/500
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Diqqat!
              </p>
              <p className="text-sm text-yellow-700">
                Teklif yuborilgandan keyin o&apos;zgartirib bo&apos;lmaydi.
              </p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Jami summa:</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(getTotal())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}