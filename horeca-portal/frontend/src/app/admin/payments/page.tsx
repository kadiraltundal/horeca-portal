'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import { formatPrice } from '@/lib/utils';

interface Payment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await api.getAdminPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, status: string) => {
    try {
      await api.updatePaymentStatus(paymentId, status);
      setPayments(
        payments.map((p) => (p.id === paymentId ? { ...p, status } : p))
      );
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Kutilmoqda',
      processing: 'Jarayonda',
      completed: 'Tugallangan',
      failed: 'Muvaffaqiyatsiz',
      refunded: 'Qaytarilgan',
    };
    return texts[status] || status;
  };

  const getMethodText = (method: string) => {
    const texts: Record<string, string> = {
      click: 'Click',
      payme: 'Payme',
      credit_card: 'Karta',
      bank_transfer: "To'lov",
      cash: 'Naqd',
    };
    return texts[method] || method;
  };

  const filteredPayments =
    filter === 'all' ? payments : payments.filter((p) => p.status === filter);

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Odemeler</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Barchasi' : getStatusText(status)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mijoz</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">
                  {payment.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {payment.user?.firstName} {payment.user?.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getMethodText(payment.method)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatPrice(payment.amount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={payment.status}
                    onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">Kutilmoqda</option>
                    <option value="processing">Jarayonda</option>
                    <option value="completed">Tugallash</option>
                    <option value="failed">Bekor qilish</option>
                    <option value="refunded">Qaytarish</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">Odemeler topilmadi</div>
        )}
      </div>
    </div>
  );
}
