'use client';

import { X, Printer, Check, ShoppingCart } from 'lucide-react';

interface ReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

export default function ReceiptModal({ orderId, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    const receiptUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/orders/${orderId}/receipt`;
    window.open(receiptUrl, '_blank', 'width=400,height=600');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success animation */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Satış Tamamlandı!</h2>
          <p className="text-sm text-gray-500 mt-1">Sipariş başarıyla oluşturuldu</p>
        </div>

        {/* Order info */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Sipariş No</p>
            <p className="text-sm font-mono font-bold text-gray-900">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={handlePrint}
            className="w-full h-12 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Fiş Yazdır
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Yeni Satış
          </button>
        </div>
      </div>
    </div>
  );
}
