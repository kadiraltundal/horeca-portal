'use client';

import { Printer, RotateCcw } from 'lucide-react';
import { ordersApi } from '@/lib/api';

interface OrderSuccessProps {
  orderId: string;
  onNewSale: () => void;
}

export default function OrderSuccess({ orderId, onNewSale }: OrderSuccessProps) {
  const handlePrint = () => {
    const url = ordersApi.getReceiptUrl(orderId);
    window.open(url, '_blank', 'width=400,height=600');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Satış Tamamlandı!</h2>
        <p className="text-gray-500 mb-1">Sipariş No:</p>
        <p className="text-lg font-mono font-bold mb-6">#{orderId.slice(0, 8)}</p>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
          >
            <Printer size={18} />
            Fiş Yazdır
          </button>

          <button
            onClick={onNewSale}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium"
          >
            <RotateCcw size={18} />
            Yeni Satış
          </button>
        </div>
      </div>
    </div>
  );
}
