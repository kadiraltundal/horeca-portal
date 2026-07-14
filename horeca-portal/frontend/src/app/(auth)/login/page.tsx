'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { user: tgUser, initData, isReady } = useTelegram();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isReady && initData && !loginAttempted) {
      setLoginAttempted(true);
      login(initData);
    }
  }, [isReady, initData, login, loginAttempted]);

  const handleManualLogin = async () => {
    if (initData) {
      setLoginAttempted(true);
      await login(initData);
    }
  };

  // Development mode - bypass Telegram login
  const handleDevLogin = async () => {
    setLoginAttempted(true);
    // Simulate Telegram login for development
    const mockInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1689000000&hash=test';
    await login(mockInitData);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col items-center justify-center px-4">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏪</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">HORECA Portal</h1>
        <p className="text-blue-100 text-lg">Powered by Kalsan</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Kirish jarayonida...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <span className="text-5xl mb-4 block">⚠️</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Xatolik yuz berdi</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={handleManualLogin}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !error && (
          <div className="text-center py-4">
            {tgUser ? (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-blue-600 font-bold">
                    {tgUser.first_name[0]}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Xush kelibsiz!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {tgUser.first_name} {tgUser.last_name || ''}
                </p>
                <button
                  onClick={handleManualLogin}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
                >
                  Davom etish
                </button>
              </>
            ) : (
              <>
                <span className="text-5xl mb-4 block">👋</span>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  HORECA Portal'ga xush kelibsiz
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Telegram hisobingiz orqali kiring
                </p>

                {/* Dev Login Button (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={handleDevLogin}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors mb-3"
                  >
                    🛠️ Development Kirish
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  Telegram Mini App orqali kirish uchun botni oching
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-blue-200 text-sm">
          © 2026 HORECA Portal. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}