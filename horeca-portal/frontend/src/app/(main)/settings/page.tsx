'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/common/Header';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    language: user?.language || 'uz',
    notifications: {
      quoteStatus: true,
      priceChange: true,
      campaigns: true,
      stock: false,
    },
  });

  const handleLanguageChange = async (lang: 'uz' | 'ru') => {
    setLoading(true);
    try {
      await api.updateProfile({ language: lang });
      setSettings((prev) => ({ ...prev, language: lang }));
      alert('Til yangilandi');
    } catch (error) {
      console.error('Failed to update language:', error);
      alert('Tilni yangilashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key: string) => {
    const newValue = !settings.notifications[key as keyof typeof settings.notifications];
    const newNotifications = {
      ...settings.notifications,
      [key]: newValue,
    };
    setSettings((prev) => ({
      ...prev,
      notifications: newNotifications,
    }));
    try {
      await api.updateProfile({ notificationPreferences: newNotifications });
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sozlamalar" showBackButton />

      <div className="px-4 py-4 space-y-4">
        {/* Language Settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Til sozlamalari</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleLanguageChange('uz')}
              className={`w-full flex items-center justify-between p-3 rounded-lg ${
                settings.language === 'uz' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇿</span>
                <span className="font-medium">O'zbekcha</span>
              </div>
              {settings.language === 'uz' && (
                <span className="text-blue-500">✓</span>
              )}
            </button>
            <button
              onClick={() => handleLanguageChange('ru')}
              className={`w-full flex items-center justify-between p-3 rounded-lg ${
                settings.language === 'ru' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇷🇺</span>
                <span className="font-medium">Русский</span>
              </div>
              {settings.language === 'ru' && (
                <span className="text-blue-500">✓</span>
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Bildirishnoma sozlamalari</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Teklif holati</p>
                <p className="text-sm text-gray-500">Teklif holati o'zgarganda xabardor qilish</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('quoteStatus')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications.quoteStatus ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications.quoteStatus ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Narx o'zgarishlari</p>
                <p className="text-sm text-gray-500">Mahsulot narxi o'zgarganda xabardor qilish</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('priceChange')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications.priceChange ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications.priceChange ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Kampaniyalar</p>
                <p className="text-sm text-gray-500">Yangi kampaniyalar haqida xabardor qilish</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('campaigns')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications.campaigns ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications.campaigns ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Stok holati</p>
                <p className="text-sm text-gray-500">Mahsulot stokga tushganda xabardor qilish</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('stock')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications.stock ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications.stock ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Hisob ma'lumotlari</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Telegram ID</span>
              <span className="font-medium">{user?.telegramId || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Username</span>
              <span className="font-medium">@{user?.username || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Ism</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Hisob yaratilgan</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">HORECA Portal v2.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Powered by Kalsan</p>
        </div>
      </div>
    </div>
  );
}