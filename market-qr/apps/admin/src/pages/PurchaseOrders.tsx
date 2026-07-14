import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import { purchaseOrdersApi, suppliersApi } from '../lib/api';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes?: string;
  expectedDate?: string;
  receivedDate?: string;
  createdAt: string;
  supplier: { id: string; name: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    receivedQty: number;
    product: { id: string; name: string; sku: string };
  }>;
}

interface Supplier {
  id: string;
  name: string;
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<PurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    supplierId: '',
    notes: '',
    expectedDate: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    suppliersApi.list(1, 100).then((data) => {
      const list = data.data || data;
      setSuppliers(Array.isArray(list) ? list : []);
    });
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersApi.list(1, 50, filterStatus || undefined);
      setOrders(data.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validItems = form.items.filter((i) => i.productId && i.quantity > 0 && i.unitPrice > 0);
      if (validItems.length === 0) {
        alert('En az bir ürün ekleyin');
        return;
      }
      await purchaseOrdersApi.create({
        supplierId: form.supplierId,
        notes: form.notes,
        expectedDate: form.expectedDate || undefined,
        items: validItems,
      });
      setShowModal(false);
      setForm({
        supplierId: '',
        notes: '',
        expectedDate: '',
        items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      });
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await purchaseOrdersApi.updateStatus(id, status);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    try {
      await purchaseOrdersApi.delete(id);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Silme başarısız');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      RECEIVED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      DRAFT: 'Taslak',
      PENDING: 'Beklemede',
      APPROVED: 'Onaylandı',
      RECEIVED: 'Alındı',
      CANCELLED: 'İptal',
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
          <h1 className="text-2xl font-bold">Satın Alma Siparişleri</h1>
          <p className="text-gray-500">Tedarikçilerden yapılan alımları yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tüm Durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="PENDING">Beklemede</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="RECEIVED">Alındı</option>
            <option value="CANCELLED">İptal</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} /> Yeni Sipariş
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sipariş No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tedarikçi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tutar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.supplier?.name}</td>
                  <td className="px-4 py-3 font-semibold">
                    {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Detay"
                      >
                        <Eye size={16} />
                      </button>
                      {order.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PENDING')}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Gönder"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Onayla"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {order.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'RECEIVED')}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Alındı"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {['DRAFT', 'PENDING'].includes(order.status) && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 size={16} />
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

      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Sipariş Detayı - {detailOrder.orderNumber}</h2>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tedarikçi</p>
                  <p className="font-medium">{detailOrder.supplier?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Durum</p>
                  {getStatusBadge(detailOrder.status)}
                </div>
                <div>
                  <p className="text-gray-500">Toplam Tutar</p>
                  <p className="font-semibold text-lg">
                    {detailOrder.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tarih</p>
                  <p>{new Date(detailOrder.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              {detailOrder.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Notlar</p>
                  <p>{detailOrder.notes}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-sm mb-2">Ürünler</p>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Ürün</th>
                      <th className="px-3 py-2 text-right">Miktar</th>
                      <th className="px-3 py-2 text-right">Birim Fiyat</th>
                      <th className="px-3 py-2 text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detailOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <p>{item.product?.name}</p>
                          <p className="text-xs text-gray-500">{item.product?.sku}</p>
                        </td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          {item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {item.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Yeni Satın Alma Siparişi</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tedarikçi *</label>
                <select
                  required
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Tedarikçi seçin</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beklenen Tarih</label>
                <input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ürünler</label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      placeholder="Ürün ID"
                      value={item.productId}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].productId = e.target.value;
                        setForm({ ...form, items });
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Miktar"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].quantity = Number(e.target.value);
                        setForm({ ...form, items });
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Birim Fiyat"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].unitPrice = Number(e.target.value);
                        setForm({ ...form, items });
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, unitPrice: 0 }] })}
                  className="text-sm text-primary-600 hover:underline"
                >
                  + Ürün Ekle
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
