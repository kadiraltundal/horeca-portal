import { useEffect, useState } from 'react';
import { Plus, Edit, MapPin, Phone, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storesApi } from '../lib/api';

export default function Stores() {
  const { token, user } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    workingHours: '',
  });

  useEffect(() => {
    loadStores();
  }, [token]);

  const loadStores = async () => {
    if (!token) return;

    try {
      const response = await storesApi.list();
      setStores(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Stores error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({ name: '', address: '', phone: '', workingHours: '' });
    setShowModal(true);
  };

  const openEditModal = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      address: store.address || '',
      phone: store.phone || '',
      workingHours: store.workingHours || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingStore) {
        await storesApi.update(editingStore.id, formData);
      } else {
        await storesApi.create(formData);
      }

      setShowModal(false);
      await loadStores();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleToggleActive = async (store: any) => {
    if (!token) return;

    try {
      await storesApi.update(store.id, { isActive: !store.isActive });
      await loadStores();
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
        <h2 className="text-2xl font-bold">Mağazalar</h2>
        {user?.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            Yeni Mağaza
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Mağaza bulunamadı
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{store.name}</h3>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => openEditModal(store)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{store.address}</span>
                </div>
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {store._count?.storeProducts || 0} ürün
                </span>
                <button
                  onClick={() => handleToggleActive(store)}
                  className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                    store.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {store.isActive ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingStore ? 'Mağaza Düzenle' : 'Yeni Mağaza'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mağaza Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri</label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Örn: 08:00-22:00"
                />
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
                  {editingStore ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
