import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Plus } from 'lucide-react';
import { stockMovementsApi, storesApi } from '../lib/api';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  product: { id: string; name: string; sku: string; price: number };
}

interface Store {
  id: string;
  name: string;
}

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [form, setForm] = useState({
    productId: '',
    type: 'IN',
    quantity: 1,
    notes: '',
  });

  useEffect(() => {
    storesApi.list().then((data) => {
      const storeList = data.data || data;
      setStores(Array.isArray(storeList) ? storeList : []);
      if (storeList.length > 0) setSelectedStore(storeList[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStore) loadMovements();
  }, [selectedStore, filterType]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await stockMovementsApi.list(selectedStore, 1, 50, filterType || undefined);
      setMovements(data.data);
      const statsData = await stockMovementsApi.getStats(selectedStore);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockMovementsApi.create({
        storeId: selectedStore,
        ...form,
        quantity: Number(form.quantity),
      });
      setShowModal(false);
      setForm({ productId: '', type: 'IN', quantity: 1, notes: '' });
      loadMovements();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownCircle size={20} className="text-green-500" />;
      case 'OUT': return <ArrowUpCircle size={20} className="text-red-500" />;
      case 'TRANSFER': return <ArrowLeftRight size={20} className="text-blue-500" />;
      case 'RETURN': return <ArrowDownCircle size={20} className="text-yellow-500" />;
      default: return <ArrowLeftRight size={20} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      IN: 'Giriş',
      OUT: 'Çıkış',
      TRANSFER: 'Transfer',
      ADJUSTMENT: 'Düzeltme',
      RETURN: 'İade',
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stok Hareketleri</h1>
          <p className="text-gray-500">Stok giriş çıkış hareketlerini takip edin</p>
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tüm Türler</option>
            <option value="IN">Giriş</option>
            <option value="OUT">Çıkış</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Düzeltme</option>
            <option value="RETURN">İade</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} /> Yeni Hareket
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Son 30 Gün Giriş</p>
            <p className="text-2xl font-bold text-green-700">{stats.inbound?.totalQuantity || 0} adet</p>
            <p className="text-xs text-green-500">{stats.inbound?.count || 0} işlem</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">Son 30 Gün Çıkış</p>
            <p className="text-2xl font-bold text-red-700">{stats.outbound?.totalQuantity || 0} adet</p>
            <p className="text-xs text-red-500">{stats.outbound?.count || 0} işlem</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ArrowLeftRight size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Henüz stok hareketi yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tür</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ürün</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Miktar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Referans</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notlar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(m.type)}
                      <span className="font-medium">{getTypeLabel(m.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{m.product.name}</p>
                      <p className="text-xs text-gray-500">{m.product.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${m.type === 'IN' || m.type === 'RETURN' ? 'text-green-600' : m.type === 'OUT' ? 'text-red-600' : 'text-gray-600'}`}>
                      {m.type === 'OUT' ? '-' : m.type === 'IN' || m.type === 'RETURN' ? '+' : ''}{m.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.referenceType || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{m.notes || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Stok Hareketi</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Ürün ID *</label>
                <input
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ürün ID girin"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tür *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="IN">Giriş</option>
                    <option value="OUT">Çıkış</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="ADJUSTMENT">Düzeltme</option>
                    <option value="RETURN">İade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Miktar *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
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
