'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import { formatPrice } from '@/lib/utils';

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName?: string;
    company?: string;
    telegramId: number;
  };
  items?: any[];
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await api.getAdminQuotes();
      setQuotes(data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, note?: string) => {
    setUpdatingId(id);
    try {
      await api.updateQuoteStatus(id, status, note);
      await loadQuotes();
    } catch (error) {
      console.error('Failed to update quote status:', error);
      alert('Durum yangilashda xatolik yuz berdi');
    } finally {
      setUpdatingId(null);
    }
  };

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
      case 'processing': return 'Jarayonda';
      case 'completed': return 'Tayyor';
      case 'rejected': return 'Bekor qilindi';
      default: return status;
    }
  };

  const filteredQuotes = filter === 'all'
    ? quotes
    : quotes.filter((q) => q.status === filter);

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    processing: quotes.filter(q => q.status === 'processing').length,
    completed: quotes.filter(q => q.status === 'completed').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Tekliflar</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Jami</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-yellow-600">Kutilmoqda</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          <p className="text-xs text-blue-600">Jarayonda</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-green-600">Tayyor</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-xs text-red-600">Bekor</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Barchasi' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm">
            <span className="text-4xl mb-2 block">📋</span>
            <p className="text-gray-500">Tepliflar topilmadi</p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-xl p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">#{quote.quoteNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString('uz-UZ', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                  {getStatusText(quote.status)}
                </span>
              </div>

              {/* Customer Info */}
              {quote.user && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {quote.user.firstName} {quote.user.lastName || ''}
                  </p>
                  {quote.user.company && (
                    <p className="text-xs text-gray-500">{quote.user.company}</p>
                  )}
                </div>
              )}

              {/* Items Summary */}
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  {quote.items?.length || 0} ta mahsulot
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatPrice(quote.totalAmount || 0)}
                </p>
              </div>

              {/* Customer Note */}
              {quote.customerNote && (
                <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium mb-1">Mijoz noti:</p>
                  <p className="text-sm text-yellow-800">{quote.customerNote}</p>
                </div>
              )}

              {/* Actions */}
              {quote.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(quote.id, 'processing')}
                    disabled={updatingId === quote.id}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Qabul qilish
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Bekor qilish sababi:');
                      if (note !== null) {
                        handleStatusUpdate(quote.id, 'rejected', note);
                      }
                    }}
                    disabled={updatingId === quote.id}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>
                </div>
              )}

              {quote.status === 'processing' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(quote.id, 'completed')}
                    disabled={updatingId === quote.id}
                    className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    ✅ Tayyor
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}