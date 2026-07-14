'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Quote } from '@/types';
import Loading from '@/components/common/Loading';
import Header from '@/components/common/Header';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [repeating, setRepeating] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [params.id]);

  const loadQuote = async () => {
    try {
      const data = await api.getQuote(params.id as string);
      setQuote(data);
    } catch (error) {
      console.error('Failed to load quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeat = async () => {
    if (!quote) return;

    setRepeating(true);
    try {
      await api.repeatQuote(quote.id);
      alert('Teklif qayta yuborildi!');
      router.push('/quotes');
    } catch (error) {
      console.error('Failed to repeat quote:', error);
      alert('Teklifni qayta yuborishda xatolik yuz berdi');
    } finally {
      setRepeating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'processing': return 'Tayyorlanmoqda';
      case 'completed': return 'Tayyor';
      case 'rejected': return 'Bekor qilindi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Teklif" showBackButton />
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">😕</span>
          <h3 className="text-lg font-semibold text-gray-900">Teklif topilmadi</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={`Teklif #${quote.quoteNumber}`} showBackButton />

      <div className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div className={`rounded-xl p-4 border ${getStatusColor(quote.status)}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getStatusIcon(quote.status)}</span>
            <div>
              <p className="font-semibold">{getStatusText(quote.status)}</p>
              <p className="text-sm opacity-75">
                {new Date(quote.createdAt).toLocaleDateString('uz-UZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Mahsulotlar</h3>
          <div className="space-y-3">
            {quote.items?.map((item) => (
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

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(quote.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Note */}
        {quote.customerNote && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Sizning e&apos;slatma</h3>
            <p className="text-gray-600">{quote.customerNote}</p>
          </div>
        )}

        {/* Admin Note */}
        {quote.adminNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Kalsan javobi</h3>
            <p className="text-blue-800">{quote.adminNote}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {quote.status === 'completed' && (
            <Button onClick={handleRepeat} loading={repeating} fullWidth>
              🔄 Qayta yuborish
            </Button>
          )}
          {quote.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-sm text-yellow-800">
                Kalsan siz bilan tez orada bog&apos;lanadi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}