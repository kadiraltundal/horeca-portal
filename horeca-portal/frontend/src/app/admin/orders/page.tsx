'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      processing: 'Tayyorlanmoqda',
      shipped: 'Yuborilgan',
      delivered: 'Yetkazilgan',
      cancelled: 'Bekor qilingan',
    };
    return texts[status] || status;
  };

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Siparisler</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raqam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mijoz</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.user?.firstName} {order.user?.lastName}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">Kutilmoqda</option>
                    <option value="confirmed">Tasdiqlash</option>
                    <option value="processing">Tayyorlash</option>
                    <option value="shipped">Yuborish</option>
                    <option value="delivered">Yetkazish</option>
                    <option value="cancelled">Bekor qilish</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">Siparislar topilmadi</div>
        )}
      </div>
    </div>
  );
}
