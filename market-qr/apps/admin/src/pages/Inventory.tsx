import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Download, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { inventoryApi, storesApi } from '../lib/api';

export default function Inventory() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editData, setEditData] = useState({
    stockQuantity: '',
    shelfNumber: '',
    minStockThreshold: '',
  });

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
        await loadInventory(storesList[0].id);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (storeId: string) => {
    try {
      const [inventoryResponse, alertsResponse] = await Promise.all([
        inventoryApi.list(storeId),
        inventoryApi.getAlerts(storeId),
      ]);

      setInventory(inventoryResponse.data || []);
      setLowStockItems(alertsResponse || []);
    } catch (error) {
      console.error('Inventory error:', error);
    }
  };

  const handleStoreChange = async (storeId: string) => {
    setSelectedStore(storeId);
    await loadInventory(storeId);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditData({
      stockQuantity: String(item.stockQuantity || 0),
      shelfNumber: item.shelfNumber || '',
      minStockThreshold: String(item.minStockThreshold || 10),
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingItem) return;

    try {
      await inventoryApi.update(selectedStore, editingItem.productId, {
        stockQuantity: parseInt(editData.stockQuantity),
        shelfNumber: editData.shelfNumber,
        minStockThreshold: parseInt(editData.minStockThreshold),
      });

      setShowEditModal(false);
      await loadInventory(selectedStore);
    } catch (error: any) {
      alert(error.message || 'Güncelleme başarısız');
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
        <h2 className="text-2xl font-bold">Stok Yönetimi</h2>
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
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
            <Download size={20} />
            Excel İçe Aktar
          </button>
          <button
            onClick={() => loadInventory(selectedStore)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <RefreshCw size={20} />
            Güncelle
          </button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Düşük Stok Uyarıları ({lowStockItems.length})</span>
          </div>
          <div className="text-sm text-red-700">
            {lowStockItems.map((item) => item.product?.name).join(', ')} ürünlerinde stok kritik seviyede.
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raf
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min. Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Güncelleme
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Stok kaydı bulunamadı
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.shelfNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.stockQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.minStockThreshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.lastUpdated).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.stockQuantity <= item.minStockThreshold
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.stockQuantity <= item.minStockThreshold ? 'Kritik' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stok Güncelle</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{editingItem.product?.name}</p>
              <p className="text-sm text-gray-500">SKU: {editingItem.product?.sku}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Miktarı</label>
                <input
                  type="number"
                  value={editData.stockQuantity}
                  onChange={(e) => setEditData({ ...editData, stockQuantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raf Numarası</label>
                <input
                  type="text"
                  value={editData.shelfNumber}
                  onChange={(e) => setEditData({ ...editData, shelfNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Örn: R1, A2-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stok Eşiği</label>
                <input
                  type="number"
                  value={editData.minStockThreshold}
                  onChange={(e) => setEditData({ ...editData, minStockThreshold: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
