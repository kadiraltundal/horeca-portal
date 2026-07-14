'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Quote } from '@/types';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Header from '@/components/common/Header';

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await api.getQuotes();
      setQuotes(data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = filter === 'all'
    ? quotes
    : quotes.filter((q) => q.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'processing': return 'Tayyorlanmoqda';
      case 'completed': return 'Tayyor';
      case 'rejected': return 'Bekor qilindi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const filterTabs: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'Barchasi', count: quotes.length },
    { value: 'pending', label: 'Kutilmoqda', count: quotes.filter(q => q.status === 'pending').length },
    { value: 'processing', label: 'Jarayonda', count: quotes.filter(q => q.status === 'processing').length },
    { value: 'completed', label: 'Tayyor', count: quotes.filter(q => q.status === 'completed').length },
  ];

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Tekliflarim" />

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.value ? 'bg-blue-400' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <div className="px-4 py-4">
        {filteredQuotes.length === 0 ? (
          <EmptyState
            icon="📋"
            title={filter === 'all' ? "Hali teklif yuborilmagan" : "Bu turda teklif yo'q"}
            description="Savatingizdan teklif yuborishingiz mumkin"
            actionLabel={filter === 'all' ? "Xaridni boshlash" : undefined}
            onAction={filter === 'all' ? () => window.location.href = '/' : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
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

                {/* Items Preview */}
                {quote.items && quote.items.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {quote.items.slice(0, 2).map((item, index) => (
                      <p key={index} className="text-sm text-gray-600 truncate">
                        • {item.product?.nameUz || 'Mahsulot'} x {item.quantity}
                      </p>
                    ))}
                    {quote.items.length > 2 && (
                      <p className="text-xs text-gray-400">
                        +{quote.items.length - 2} ta boshqa mahsulot
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {quote.items?.length || 0} ta mahsulot
                    </span>
                    {quote.customerNote && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        📝 Not
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-blue-600">
                    ${quote.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}