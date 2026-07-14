'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import { ordersApi } from '@/lib/api';

interface Order {
  id: string;
  totalAmount: number;
  discountAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user?: { firstName: string; lastName: string };
  orderItems?: Array<{ product: { name: string }; quantity: number; subtotal: number }>;
}

interface OrdersPageProps {
  storeId: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
  PAID: { text: 'Ödendi', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { text: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
  CANCELLED: { text: 'İptal', color: 'bg-red-100 text-red-700' },
  REFUNDED: { text: 'İade', color: 'bg-purple-100 text-purple-700' },
};

export default function OrdersPage({ storeId }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [storeId]);

  const loadOrders = async () => {
    try {
      const res = await ordersApi.list(storeId);
      setOrders(res.data || []);
    } catch (e) {
      console.error('Orders load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Siparişler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-xl shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShoppingCart size={20} />
          Siparişler
        </h2>
        <span className="text-sm text-gray-500">{orders.length} sipariş</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600">Sipariş No</th>
              <th className="text-left p-3 font-semibold text-gray-600">Tarih</th>
              <th className="text-left p-3 font-semibold text-gray-600">Kasiyer</th>
              <th className="text-left p-3 font-semibold text-gray-600">Ödeme</th>
              <th className="text-center p-3 font-semibold text-gray-600">Durum</th>
              <th className="text-right p-3 font-semibold text-gray-600">Tutar</th>
              <th className="text-center p-3 font-semibold text-gray-600">Detay</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="p-3">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="p-3 text-gray-500">{order.paymentMethod === 'CASH' ? 'Nakit' : 'Kart'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Henüz sipariş yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="border-t p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Sipariş Detayı — #{selectedOrder.id.slice(0, 8)}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ürünler:</p>
              {selectedOrder.orderItems?.map((item, i) => (
                <p key={i} className="ml-2">
                  {item.product.name} x{item.quantity} — {item.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </p>
              ))}
            </div>
            <div>
              <p>Ara Toplam: <span className="font-semibold">{selectedOrder.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></p>
              {selectedOrder.discountAmount > 0 && (
                <p>İndirim: <span className="text-red-600">-{selectedOrder.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
