'use client';

import { useState, useRef } from 'react';
import { Camera, Scale, RotateCcw, RefreshCw } from 'lucide-react';

interface BarcodeInputProps {
  onBarcodeScan: (barcode: string) => void;
  onQRScan: () => void;
  onReturn?: () => void;
}

export default function BarcodeInput({ onBarcodeScan, onQRScan, onReturn }: BarcodeInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onBarcodeScan(value.trim());
      setValue('');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
      {/* QR / Camera button */}
      <button
        onClick={onQRScan}
        className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all"
        title="QR / Kamera ile Tara"
      >
        <Camera size={20} />
      </button>

      <button
        className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all"
        title="Tartı"
      >
        <Scale size={20} />
      </button>

      {/* Barcode Input */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Barkod / QR"
          className="w-full h-10 pl-4 pr-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </form>

      {/* Customer quick select */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className="px-3 py-2 bg-primary-100 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-200 transition-colors"
          >
            Müşteri {n}
          </button>
        ))}
      </div>

      {/* Return / Exchange */}
      <div className="h-6 w-px bg-gray-200 mx-1" />
      <button
        onClick={onReturn}
        className="px-3 py-2 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-1"
      >
        <RotateCcw size={14} />
        İade
      </button>
      <button className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
        <RefreshCw size={14} />
        Değişim
      </button>
    </div>
  );
}
