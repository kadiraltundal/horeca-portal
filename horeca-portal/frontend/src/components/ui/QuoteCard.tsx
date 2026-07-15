'use client';

import Link from 'next/link';
import { Quote } from '@/types';
import { formatPrice } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'processing':
        return 'Tayyorlanmoqda';
      case 'completed':
        return 'Tayyor';
      case 'rejected':
        return 'Bekor qilindi';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <Link
      href={`/quotes/${quote.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900">#{quote.quoteNumber}</p>
          <p className="text-sm text-gray-500">
            {new Date(quote.createdAt).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
            quote.status
          )}`}
        >
          {getStatusIcon(quote.status)} {getStatusText(quote.status)}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {quote.items?.length || 0} ta mahsulot
        </p>
        <p className="font-bold text-gray-900">
          {formatPrice(quote.totalAmount || 0)}
        </p>
      </div>
    </Link>
  );
}