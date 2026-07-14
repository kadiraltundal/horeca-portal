'use client';

import { useState, useCallback } from 'react';
import { Delete, Check, RotateCcw, Plus, Minus } from 'lucide-react';

interface NumPadProps {
  mode: 'barcode' | 'quantity';
  onSubmit: (value: string) => void;
  selectedProductName?: string;
  currentQuantity?: number;
}

export default function NumPad({ mode, onSubmit, selectedProductName, currentQuantity = 1 }: NumPadProps) {
  const [display, setDisplay] = useState('');
  const [qtySign, setQtySign] = useState(1);

  const handleDigit = useCallback((digit: string) => {
    setDisplay(prev => prev + digit);
  }, []);

  const handleClear = useCallback(() => {
    setDisplay('');
    setQtySign(1);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay(prev => prev.slice(0, -1));
  }, []);

  const handleDoubleZero = useCallback(() => {
    setDisplay(prev => prev + '00');
  }, []);

  const handleToggleSign = useCallback(() => {
    setQtySign(prev => prev * -1);
  }, []);

  const handleOk = useCallback(() => {
    if (!display) return;
    onSubmit(display);
    setDisplay('');
  }, [display, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    else if (e.key === '.' || e.key === ',') handleDigit('.');
    else if (e.key === 'Backspace') handleBackspace();
    else if (e.key === 'Escape') handleClear();
    else if (e.key === 'Enter') handleOk();
  }, [handleDigit, handleBackspace, handleClear, handleOk]);

  const previewValue = mode === 'quantity'
    ? `${qtySign > 0 ? '+' : ''}${qtySign * (Number(display) || 0)}`
    : display || '0';

  const btn = "h-12 rounded-lg font-bold text-lg transition-all active:scale-95 select-none flex items-center justify-center";
  const numBtn = `${btn} bg-gray-100 hover:bg-gray-200 text-gray-900`;
  const actionBtn = `${btn} bg-gray-200 hover:bg-gray-300 text-gray-700`;
  const okBtn = `${btn} bg-green-600 hover:bg-green-700 text-white`;
  const clearBtn = `${btn} bg-red-100 hover:bg-red-200 text-red-600`;

  return (
    <div className="bg-white border-t border-gray-200 p-3" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Mode indicator + display */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            {mode === 'barcode' ? 'Barkod / QR' : `Miktar — ${selectedProductName || ''}`}
          </span>
          {mode === 'quantity' && (
            <span className="text-[10px] text-gray-400">Mevcut: {currentQuantity}</span>
          )}
        </div>
        <div className="h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3">
          <span className="text-lg font-mono font-bold text-gray-900 truncate">
            {mode === 'quantity' && display ? previewValue : display || ''}
          </span>
          {!display && (
            <span className="text-sm text-gray-400 ml-1">
              {mode === 'barcode' ? 'Barkod veya QR kodu girin...' : 'Miktar girin...'}
            </span>
          )}
        </div>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={() => handleDigit('7')} className={numBtn}>7</button>
        <button onClick={() => handleDigit('8')} className={numBtn}>8</button>
        <button onClick={() => handleDigit('9')} className={numBtn}>9</button>
        <button onClick={handleBackspace} className={actionBtn}><Delete size={20} /></button>

        <button onClick={() => handleDigit('4')} className={numBtn}>4</button>
        <button onClick={() => handleDigit('5')} className={numBtn}>5</button>
        <button onClick={() => handleDigit('6')} className={numBtn}>6</button>
        <button onClick={handleOk} className={okBtn}><Check size={20} /></button>

        <button onClick={() => handleDigit('1')} className={numBtn}>1</button>
        <button onClick={() => handleDigit('2')} className={numBtn}>2</button>
        <button onClick={() => handleDigit('3')} className={numBtn}>3</button>
        <button onClick={handleToggleSign} className={actionBtn}>
          {qtySign > 0 ? <Plus size={20} /> : <Minus size={20} />}
        </button>

        <button onClick={() => handleDigit('0')} className={numBtn}>0</button>
        <button onClick={() => handleDigit('.')} className={numBtn}>.</button>
        <button onClick={handleDoubleZero} className={numBtn}>00</button>
        <button onClick={handleClear} className={clearBtn}><RotateCcw size={20} /></button>
      </div>
    </div>
  );
}
