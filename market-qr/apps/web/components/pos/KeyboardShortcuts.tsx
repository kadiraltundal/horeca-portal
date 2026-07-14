'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onCashSale?: () => void;
  onPosSale?: () => void;
  onPartialPayment?: () => void;
  onClearCart?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
  onDeleteLast?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === 'Escape') {
        (e.target as HTMLElement).blur();
        handlers.onEscape?.();
      }
      return;
    }

    switch (e.key) {
      case 'F1':
        e.preventDefault();
        handlers.onCashSale?.();
        break;
      case 'F2':
        e.preventDefault();
        handlers.onPosSale?.();
        break;
      case 'F3':
        e.preventDefault();
        handlers.onPartialPayment?.();
        break;
      case 'F5':
        e.preventDefault();
        handlers.onClearCart?.();
        break;
      case 'F6':
        e.preventDefault();
        handlers.onFocusSearch?.();
        break;
      case 'Escape':
        handlers.onEscape?.();
        break;
      case 'Delete':
        handlers.onDeleteLast?.();
        break;
    }
  }, [enabled, handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
