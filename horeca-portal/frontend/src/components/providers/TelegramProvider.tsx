'use client';

import { useEffect, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface TelegramProviderProps {
  children: ReactNode;
}

export default function TelegramProvider({ children }: TelegramProviderProps) {
  const { webApp, isReady } = useTelegram();

  useEffect(() => {
    if (!isReady || !webApp) return;

    // Set header color
    webApp.headerColor = '#ffffff';
    webApp.backgroundColor = '#f5f5f5';
    webApp.bottomBarColor = '#ffffff';

    // Handle back button
    const handleBackButton = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        webApp.close();
      }
    };

    webApp.BackButton.onClick(handleBackButton);

    // Cleanup
    return () => {
      webApp.BackButton.offClick(handleBackButton);
    };
  }, [isReady, webApp]);

  return <>{children}</>;
}
