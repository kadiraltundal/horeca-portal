'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, isLoading, removeItem, updateItem, getTotal, getItemCount, loadCart } =
    useCartStore();
  const { showMainButton, hideMainButton, sendMainButtonClicked, showBackButton, hideBackButton, sendBackButtonClicked, hapticFeedback } = useTelegram();

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    // Back button
    showBackButton();
    sendBackButtonClicked(() => router.back());

    // Main button
    if (items.length > 0) {
      showMainButton(`Teklif yuborish • ${formatPrice(getTotal())}`);
      sendMainButtonClicked(() => {
        hapticFeedback('notification', 'success');
        router.push('/quotes/new');
      });
    } else {
      hideMainButton();
    }

    return () => {
      hideMainButton();
      hideBackButton();
    };
  }, [items]);

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-bg-color, #f5f5f5)' }}>
        <div 
          className="w-12 h-12 rounded-full animate-spin"
          style={{ 
            border: '3px solid var(--tg-secondary-bg-color, #e0e0e0)',
            borderTopColor: 'var(--tg-button-color, #2481cc)'
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--tg-bg-color, #f5f5f5)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}>
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--tg-text-color, #000000)' }}>
            Teklif Savati
          </h1>
          <p className="text-sm" style={{ color: 'var(--tg-hint-color, #999999)' }}>
            {getItemCount()} ta mahsulot
          </p>
        </div>
      </header>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--tg-secondary-bg-color, #f1f1f1)' }}>
            <span className="text-5xl">🛒</span>
          </div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--tg-text-color, #000000)' }}>
            Savatingiz bo'sh
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--tg-hint-color, #999999)' }}>
            Mahsulotlarni tanlab, teklif yuboring
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: 'var(--tg-button-color, #2481cc)' }}
            onClick={() => hapticFeedback('impact', 'medium')}
          >
            Xaridni boshlash
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--tg-bg-color, #f1f1f1)' }}>
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0].imageUrl}
                      alt={item.product.nameUz}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" style={{ color: 'var(--tg-text-color, #000000)' }}>
                    {item.product?.nameUz || 'Mahsulot'}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                    {formatPrice(item.unitPrice)} / dona
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--tg-button-color, #2481cc)' }}>
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => {
                    hapticFeedback('impact', 'light');
                    removeItem(item.id);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--tg-bg-color, #f1f1f1)' }}
                >
                  <svg className="w-4 h-4" style={{ color: 'var(--tg-hint-color, #999999)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      hapticFeedback('selection');
                      updateItem(item.id, Math.max(1, item.quantity - 1));
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                    style={{ 
                      backgroundColor: 'var(--tg-bg-color, #f1f1f1)',
                      color: 'var(--tg-text-color, #000000)'
                    }}
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: 'var(--tg-text-color, #000000)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      hapticFeedback('selection');
                      updateItem(item.id, item.quantity + 1);
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                    style={{ 
                      backgroundColor: 'var(--tg-button-color, #2481cc)',
                      color: 'var(--tg-button-text-color, #ffffff)'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Note */}
                {item.note && (
                  <p className="text-xs truncate max-w-[150px]" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                    📝 {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--tg-hint-color, #999999)' }}>Jami:</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--tg-text-color, #000000)' }}>
                {formatPrice(getTotal())}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
