'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useTelegram } from '@/hooks/useTelegram';
import { setupApiInterceptor } from '@/lib/api-interceptor';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { loadUser, isAuthenticated, login } = useAuthStore();
  const { loadCart } = useCartStore();
  const { initData, isReady, user } = useTelegram();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Setup API interceptor for token refresh
    setupApiInterceptor();

    // Try to load user from stored token first
    loadUser().then(() => {
      // Load cart immediately if user is authenticated
      if (useAuthStore.getState().isAuthenticated) {
        loadCart();
      }
      setIsInitialized(true);
    }).catch(() => {
      setIsInitialized(true);
    });
  }, []);

  useEffect(() => {
    // If Telegram is ready and we have initData, try to login
    if (isReady && initData && !isAuthenticated) {
      login(initData).then(() => {
        // Load cart after successful Telegram login
        if (useAuthStore.getState().isAuthenticated) {
          loadCart();
        }
      });
    }
  }, [isReady, initData, isAuthenticated]);

  useEffect(() => {
    // Load cart when user becomes authenticated (from login state change)
    if (isAuthenticated && isInitialized) {
      loadCart();
    }
  }, [isAuthenticated, loadCart, isInitialized]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-bg-color, #f5f5f5)' }}>
        <div className="flex flex-col items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full animate-spin"
            style={{ 
              border: '3px solid var(--tg-secondary-bg-color, #e0e0e0)',
              borderTopColor: 'var(--tg-button-color, #2481cc)'
            }}
          />
          <p style={{ color: 'var(--tg-hint-color, #999999)' }}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Demo mode: show banner when not in Telegram
  if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
    return (
      <>
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800">
          Demo Mode - Telegram Mini App ichida oching: @horeca_kalsan_bot
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
