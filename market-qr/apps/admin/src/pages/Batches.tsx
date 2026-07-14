import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { batchesApi, productsApi, storesApi } from '../lib/api';

export default function Batches() {
  const { token } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
    warehouseId: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      const [batchesResponse, productsResponse, storesResponse] = await Promise.all([
        batchesApi.list(),
        productsApi.listByStore('default'),
        storesApi.list(),
      ]);

      const batchesList = Array.isArray(batchesResponse) ? batchesResponse : batchesResponse.data || [];
      const productsList = Array.isArray(productsResponse) ? productsResponse : productsResponse.data || [];
      const storesList = Array.isArray(storesResponse) ? storesResponse : storesResponse.data || [];

      setBatches(batchesList);
      setProducts(productsList);
      setStores(storesList);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      await batchesApi.create(data);
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string, days = 30) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= days;
  };

  const getExpiryBadge = (expiryDate: string) => {
    if (isExpired(expiryDate)) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Süresi Dolmuş</span>;
    }
    if (isExpiringSoon(expiryDate)) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Yaklaşıyor</span>;
    }
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Geçerli</span>;
  };

  const getRowClass = (expiryDate: string) => {
    if (isExpired(expiryDate)) return 'bg-red-50';
    if (isExpiringSoon(expiryDate)) return 'bg-yellow-50';
    return '';
  };

  const filteredBatches = batches.filter((batch) => {
    if (filterExpired && !isExpired(batch.expiryDate)) return false;
    if (filterExpiringSoon && !isExpiringSoon(batch.expiryDate)) return false;
    return true;
  });

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
        <h2 className="text-2xl font-bold">Partiler</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filterExpired"
              checked={filterExpired}
              onChange={(e) => setFilterExpired(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="filterExpired" className="text-sm text-gray-700">Süresi Dolmuş</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filterExpiringSoon"
              checked={filterExpiringSoon}
              onChange={(e) => setFilterExpiringSoon(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="filterExpiringSoon" className="text-sm text-gray-700">Yaklaşıyor</label>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            Yeni Parti
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parti No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miktar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Kullanma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Parti bulunamadı
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => (
                <tr key={batch.id} className={`hover:bg-gray-50 ${getRowClass(batch.expiryDate)}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {batch.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {batch.product?.name || batch.productId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {batch.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {new Date(batch.expiryDate).toLocaleDateString('tr-TR')}
                      {isExpired(batch.expiryDate) && <AlertTriangle size={16} className="text-red-500" />}
                      {isExpiringSoon(batch.expiryDate) && !isExpired(batch.expiryDate) && <Clock size={16} className="text-yellow-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getExpiryBadge(batch.expiryDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Parti</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Ürün seçin</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parti No</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depo</label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Depo seçin</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
