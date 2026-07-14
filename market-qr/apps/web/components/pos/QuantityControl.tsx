'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onChange: (quantity: number) => void;
}

export default function QuantityControl({ quantity, onChange }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => onChange(quantity - 1)}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-all active:scale-90"
      >
        <Minus size={12} strokeWidth={3} />
      </button>
      <span className="w-8 h-7 flex items-center justify-center text-xs font-bold text-gray-800 bg-white">
        {quantity}
      </span>
      <button
        onClick={() => onChange(quantity + 1)}
        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-all active:scale-90"
      >
        <Plus size={12} strokeWidth={3} />
      </button>
    </div>
  );
}
