import { useState, useEffect } from 'react';
import { RotateCcw, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { refundsApi, storesApi } from '../lib/api';

interface Refund {
  id: string;
  amount: number;
  reason?: string;
  status: string;
  processedAt?: string;
  createdAt: string;
  order: {
    id: string;
    totalAmount: number;
    orderItems: Array<{
      quantity: number;
      unitPrice: number;
      product: { name: string; sku: string };
    }>;
  };
}

interface Store {
  id: string;
  name: string;
}

export default function Refunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [detailRefund, setDetailRefund] = useState<Refund | null>(null);

  useEffect(() => {
    storesApi.list().then((data) => {
      const list = data.data || data;
      setStores(Array.isArray(list) ? list : []);
      if (list.length > 0) setSelectedStore(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStore) loadRefunds();
  }, [selectedStore, filterStatus]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const data = await refundsApi.list(selectedStore, 1, 50, filterStatus || undefined);
      setRefunds(data.data);
    } catch (err) {
      console.error('Failed to load refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await refundsApi.updateStatus(id, status);
      loadRefunds();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      PENDING: 'Beklemede',
      APPROVED: 'Onaylandı',
      COMPLETED: 'Tamamlandı',
      REJECTED: 'Reddedildi',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">İadeler</h1>
          <p className="text-gray-500">İade taleplerini yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="REJECTED">Reddedildi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : refunds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <RotateCcw size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Henüz iade yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sipariş</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İade Tutarı</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sebep</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{refund.order?.id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-semibold text-red-600">
                    {refund.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                    {refund.reason || '-'}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(refund.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(refund.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailRefund(refund)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Detay"
                      >
                        <Eye size={16} />
                      </button>
                      {refund.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(refund.id, 'APPROVED')}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Onayla"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(refund.id, 'REJECTED')}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Reddet"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {refund.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(refund.id, 'COMPLETED')}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Tamamla"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">İade Detayı</h2>
              <button onClick={() => setDetailRefund(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">İade Tutarı</p>
                  <p className="font-semibold text-lg text-red-600">
                    {detailRefund.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Durum</p>
                  {getStatusBadge(detailRefund.status)}
                </div>
              </div>
              {detailRefund.reason && (
                <div>
                  <p className="text-gray-500 text-sm">Sebep</p>
                  <p>{detailRefund.reason}</p>
                </div>
              )}
              {detailRefund.order && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Sipariş Ürünleri</p>
                  <div className="bg-gray-50 rounded p-3">
                    {detailRefund.order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{item.product?.name} x{item.quantity}</span>
                        <span>{item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
