import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, storesApi } from '../lib/api';

const statusMap: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  PAID: { label: 'Ödendi', color: 'bg-blue-100 text-blue-800' },
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'İade', color: 'bg-purple-100 text-purple-800' },
};

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      const storesResponse = await storesApi.list();
      const storesList = Array.isArray(storesResponse) ? storesResponse : storesResponse.data || [];
      setStores(storesList);

      if (storesList.length > 0) {
        setSelectedStore(storesList[0].id);
        await loadOrders(storesList[0].id);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (storeId: string, status?: string) => {
    try {
      const response = await ordersApi.list(storeId, 1, 50, status || undefined);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Orders error:', error);
    }
  };

  const handleStoreChange = async (storeId: string) => {
    setSelectedStore(storeId);
    setFilterStatus('');
    await loadOrders(storeId);
  };

  const handleFilterChange = async (status: string) => {
    setFilterStatus(status);
    await loadOrders(selectedStore, status);
  };

  const viewOrderDetail = async (orderId: string) => {
    try {
      const order = await ordersApi.get(orderId);
      setSelectedOrder(order);
      setShowDetail(true);
    } catch (error) {
      console.error('Order detail error:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`Sipariş durumunu "${statusMap[newStatus]?.label || newStatus}" olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await loadOrders(selectedStore, filterStatus);
      setShowDetail(false);
    } catch (error: any) {
      alert(error.message || 'Durum güncellenemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Siparişler</h2>
        <div className="flex gap-2">
          <select
            value={selectedStore}
            onChange={(e) => handleStoreChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="PAID">Ödendi</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
            <option value="REFUNDED">İade</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sipariş No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Sipariş bulunamadı
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.firstName} {order.user?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderItems?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => viewOrderDetail(order.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sipariş Detayı</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sipariş No</p>
                  <p className="font-medium">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Müşteri</p>
                  <p className="font-medium">
                    {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusMap[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusMap[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Ürünler</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ₺{item.unitPrice?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">₺{item.subtotal?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam</span>
                  <span className="text-xl font-bold">₺{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.status === 'PENDING' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'PAID')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ödendi İşaretle
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    İptal Et
                  </button>
                </div>
              )}

              {selectedOrder.status === 'PAID' && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'COMPLETED')}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-4"
                >
                  Tamamlandı İşaretle
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
