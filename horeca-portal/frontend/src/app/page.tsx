'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';

interface Category {
  id: string;
  nameUz: string;
  nameRu?: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
}

export default function Home() {
  const { user, isReady, colorScheme, hapticFeedback } = useTelegram();
  const { getItemCount } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      // Fallback to static data if API fails
      setCategories([
        { id: '1', nameUz: 'Kimyoviy mahsulotlar', slug: 'kimyoviy-mahsulotlar', icon: '🧴' },
        { id: '2', nameUz: 'Qogoz mahsulotlar', slug: 'qogoz-mahsulotlar', icon: '📄' },
        { id: '3', nameUz: 'Tekstil', slug: 'tekstil', icon: '🧵' },
        { id: '4', nameUz: 'Asbob-uskunalar', slug: 'asboblar', icon: '🔧' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      hapticFeedback('selection');
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-bg-color, #f5f5f5)' }}>
      {/* Header - Telegram Style */}
      <header 
        className="sticky top-0 z-10"
        style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Telegram Logo */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--tg-text-color, #000000)' }}>
                  HORECA Portal
                </h1>
                <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                  Powered by Kalsan
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--tg-text-color, #000000)' }}>
                    {user.first_name}
                  </p>
                  {user.username && (
                    <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                      @{user.username}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold">
                  {user.first_name?.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar - Telegram Style */}
      <div 
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-3 pl-12 text-sm rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: 'var(--tg-bg-color, #f1f1f1)',
              color: 'var(--tg-text-color, #000000)'
            }}
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5"
            style={{ color: 'var(--tg-hint-color, #999999)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Welcome Message */}
        {user && (
          <div 
            className="mb-4 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--tg-button-color, #2481cc)' }}
          >
            <p className="text-white font-medium">
              👋 {user.first_name}, xush kelibsiz!
            </p>
            <p className="text-white/80 text-sm mt-1">
              Kalsan mahsulotlarini koring va teklif yuboring
            </p>
          </div>
        )}

        {/* Quick Actions - Telegram Style */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/favorites"
            className="flex items-center gap-3 p-4 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
            onClick={() => hapticFeedback('impact', 'light')}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--tg-text-color, #000000)' }}>
                Sevimlilar
              </p>
              <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                Saqlangan mahsulotlar
              </p>
            </div>
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-3 p-4 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
            onClick={() => hapticFeedback('impact', 'light')}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--tg-text-color, #000000)' }}>
                Teklif Savati
              </p>
              <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                Tanlangan mahsulotlar
              </p>
            </div>
          </Link>
          <Link
            href="/quotes"
            className="flex items-center gap-3 p-4 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
            onClick={() => hapticFeedback('impact', 'light')}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--tg-text-color, #000000)' }}>
                Tekliflarim
              </p>
              <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                Yuborilgan tekliflar
              </p>
            </div>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
            onClick={() => hapticFeedback('impact', 'light')}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--tg-text-color, #000000)' }}>
                Profil
              </p>
              <p className="text-xs" style={{ color: 'var(--tg-hint-color, #999999)' }}>
                Shaxsiy ma'lumotlar
              </p>
            </div>
          </Link>
        </div>

        {/* Categories - Telegram Style */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--tg-text-color, #000000)' }}>
              Kategoriyalar
            </h2>
            <Link 
              href="/categories" 
              className="text-sm font-medium"
              style={{ color: 'var(--tg-link-color, #2481cc)' }}
            >
              Barchasi →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-24 rounded-xl animate-pulse"
                  style={{ backgroundColor: 'var(--tg-secondary-bg-color, #f1f1f1)' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)' }}
                  onClick={() => hapticFeedback('selection')}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <span className="text-3xl">{category.icon || '📦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--tg-text-color, #000000)' }}>
                      {category.nameUz}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Promo Banner */}
        <section className="mt-6">
          <div 
            className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <p className="text-white font-bold text-lg">🎁 Maxsus taklif!</p>
            <p className="text-white/90 text-sm mt-1">
              Birinchi buyurtmangizga 10% chegirma
            </p>
            <button 
              className="mt-3 px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm"
              onClick={() => hapticFeedback('notification', 'success')}
            >
              Batafsil
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Telegram Style */}
      <nav 
        className="fixed bottom-0 left-0 right-0 border-t"
        style={{ 
          backgroundColor: 'var(--tg-secondary-bg-color, #ffffff)',
          borderColor: 'var(--tg-bg-color, #e0e0e0)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link
            href="/"
            className="flex flex-col items-center py-2 transition-all active:scale-95"
            style={{ color: 'var(--tg-button-color, #2481cc)' }}
            onClick={() => hapticFeedback('selection')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Bosh sahifa</span>
          </Link>
          <Link
            href="/categories"
            className="flex flex-col items-center py-2 transition-all active:scale-95"
            style={{ color: 'var(--tg-hint-color, #999999)' }}
            onClick={() => hapticFeedback('selection')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">Kategoriyalar</span>
          </Link>
          <Link
            href="/cart"
            className="flex flex-col items-center py-2 transition-all active:scale-95"
            style={{ color: 'var(--tg-hint-color, #999999)' }}
            onClick={() => hapticFeedback('selection')}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getItemCount() > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                  style={{ backgroundColor: 'var(--tg-button-color, #2481cc)' }}
                >
                  {getItemCount()}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Savat</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center py-2 transition-all active:scale-95"
            style={{ color: 'var(--tg-hint-color, #999999)' }}
            onClick={() => hapticFeedback('selection')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
