'use client';

import { useEffect, useState, useCallback } from 'react';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'success' | 'warning' | 'error'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  platform: string;
  viewportHeight: number;
  viewportStableHeight: number;
  isVerticalSwipingEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      tg.ready();
      tg.expand();
      setIsReady(true);
      setIsExpanded(true);

      // Set theme colors
      document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-hint-color', tg.themeParams.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-link-color', tg.themeParams.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-color', tg.themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f1f1');
    } else {
      // Default theme for browser/demo mode
      document.documentElement.style.setProperty('--tg-bg-color', '#f5f5f5');
      document.documentElement.style.setProperty('--tg-text-color', '#000000');
      document.documentElement.style.setProperty('--tg-hint-color', '#999999');
      document.documentElement.style.setProperty('--tg-link-color', '#2481cc');
      document.documentElement.style.setProperty('--tg-button-color', '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', '#ffffff');
      // Mark as ready even without Telegram for demo mode
      setIsReady(true);
    }
  }, []);

  const user = webApp?.initDataUnsafe?.user;

  const sendMainButtonClicked = useCallback((callback: () => void) => {
    webApp?.MainButton.onClick(callback);
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide();
  }, [webApp]);

  const showMainButton = useCallback((text: string) => {
    webApp?.MainButton.setText(text);
    webApp?.MainButton.show();
  }, [webApp]);

  const enableMainButton = useCallback(() => {
    webApp?.MainButton.enable();
  }, [webApp]);

  const disableMainButton = useCallback(() => {
    webApp?.MainButton.disable();
  }, [webApp]);

  const showBackButton = useCallback(() => {
    webApp?.BackButton.show();
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide();
  }, [webApp]);

  const sendBackButtonClicked = useCallback((callback: () => void) => {
    webApp?.BackButton.onClick(callback);
  }, [webApp]);

  const hapticFeedback = useCallback((type: 'impact' | 'notification' | 'selection', style?: string) => {
    if (!webApp?.HapticFeedback) return;
    
    switch (type) {
      case 'impact':
        webApp.HapticFeedback.impactOccurred((style as any) || 'medium');
        break;
      case 'notification':
        webApp.HapticFeedback.notificationOccurred((style as any) || 'success');
        break;
      case 'selection':
        webApp.HapticFeedback.selectionChanged();
        break;
    }
  }, [webApp]);

  const enableClosingConfirmation = useCallback(() => {
    webApp?.enableClosingConfirmation();
  }, [webApp]);

  const disableClosingConfirmation = useCallback(() => {
    webApp?.disableClosingConfirmation();
  }, [webApp]);

  return {
    webApp,
    isReady,
    isExpanded,
    user,
    initData: webApp?.initData || '',
    themeParams: webApp?.themeParams,
    colorScheme: webApp?.colorScheme || 'light',
    platform: webApp?.platform || 'unknown',
    sendMainButtonClicked,
    hideMainButton,
    showMainButton,
    enableMainButton,
    disableMainButton,
    showBackButton,
    hideBackButton,
    sendBackButtonClicked,
    hapticFeedback,
    enableClosingConfirmation,
    disableClosingConfirmation,
  };
}
