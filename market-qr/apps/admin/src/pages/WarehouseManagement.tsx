import { useEffect, useState } from 'react';
import { Plus, X, ArrowRightLeft, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const statusMap: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
  CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800' },
};

type Tab = 'depo' | 'stok' | 'bolgeler' | 'gorevler' | 'transfer';

export default function WarehouseManagement() {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('depo');
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    productId: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [warehousesRes, transfersRes] = await Promise.all([
        fetch(`${API_URL}/warehouses`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/warehouse-transfers`, { headers }).then(r => r.json()),
      ]);
      setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : warehousesRes.data || []);
      setTransfers(Array.isArray(transfersRes) ? transfersRes : transfersRes.data || []);
    } catch (error) {
      console.error('Warehouse load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseDetail = async (warehouseId: string) => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [stockRes, zonesRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/warehouses/${warehouseId}/stock`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/warehouses/${warehouseId}/zones`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/warehouses/${warehouseId}/tasks`, { headers }).then(r => r.json()),
      ]);
      setStockItems(Array.isArray(stockRes) ? stockRes : stockRes.data || []);
      setZones(Array.isArray(zonesRes) ? zonesRes : zonesRes.data || []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : tasksRes.data || []);
    } catch (error) {
      console.error('Warehouse detail error:', error);
    }
  };

  const handleWarehouseSelect = async (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    await loadWarehouseDetail(warehouse.id);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await fetch(`${API_URL}/warehouse-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...transferForm, quantity: parseInt(transferForm.quantity) }),
      });
      setShowTransferModal(false);
      setTransferForm({ fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: '', notes: '' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Transfer oluşturulamadı');
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'depo', label: 'Depo Listesi' },
    { key: 'stok', label: 'Stok' },
    { key: 'bolgeler', label: 'Bölgeler' },
    { key: 'gorevler', label: 'Görevler' },
    { key: 'transfer', label: 'Transferler' },
  ];

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
        <h2 className="text-2xl font-bold">Depo Yönetimi</h2>
        {activeTab === 'transfer' && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            Yeni Transfer
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Depo Listesi */}
      {activeTab === 'depo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-8">Depo bulunamadı</p>
          ) : (
            warehouses.map((wh) => (
              <div
                key={wh.id}
                onClick={() => handleWarehouseSelect(wh)}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedWarehouse?.id === wh.id ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Package size={24} className="text-primary-600" />
                  <h3 className="font-semibold text-lg">{wh.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-2">{wh.address || 'Adres belirtilmemiş'}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Alan: {wh.area || '-'}</span>
                  <span className="text-gray-500">Kapasite: {wh.capacity || '-'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stok Tab */}
      {activeTab === 'stok' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!selectedWarehouse ? (
            <p className="text-gray-500 text-center py-8">Depo Listesi sekmesinden bir depo seçin</p>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-medium">{selectedWarehouse.name} - Stok Listesi</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockItems.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Stok bulunamadı</td></tr>
                  ) : (
                    stockItems.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName || item.product?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku || item.product?.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity < 10 ? 'Kritik' : 'Yeterli'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Bölgeler Tab */}
      {activeTab === 'bolgeler' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!selectedWarehouse ? (
            <p className="text-gray-500 text-center py-8">Depo Listesi sekmesinden bir depo seçin</p>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-medium">{selectedWarehouse.name} - Bölgeler</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {zones.length === 0 ? (
                  <p className="text-gray-500 col-span-3 text-center">Bölge bulunamadı</p>
                ) : (
                  zones.map((zone: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">{zone.name}</h4>
                      <p className="text-sm text-gray-500">Kapasite: {zone.capacity || '-'}</p>
                      <p className="text-sm text-gray-500">Doluluk: {zone.currentStock || 0}</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${zone.capacity ? (zone.currentStock / zone.capacity) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Görevler Tab */}
      {activeTab === 'gorevler' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!selectedWarehouse ? (
            <p className="text-gray-500 text-center py-8">Depo Listesi sekmesinden bir depo seçin</p>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-medium">{selectedWarehouse.name} - Görevler</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görev</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Görev bulunamadı</td></tr>
                  ) : (
                    tasks.map((task: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title || task.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[task.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusMap[task.status]?.label || task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Transfer Geçmişi */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kaynak Depo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hedef Depo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Transfer bulunamadı</td></tr>
              ) : (
                transfers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.fromWarehouse?.name || t.fromWarehouseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.toWarehouse?.name || t.toWarehouseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.product?.name || t.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[t.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[t.status]?.label || t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Transfer</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak Depo</label>
                <select
                  value={transferForm.fromWarehouseId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Depo seçin</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Depo</label>
                <select
                  value={transferForm.toWarehouseId}
                  onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Depo seçin</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                <input
                  type="number"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                  <ArrowRightLeft size={16} />
                  Transfer Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
