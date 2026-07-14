import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi } from '../lib/api';

type TabType = 'companies' | 'regions' | 'warehouses';

export default function Organizations() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('companies');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Companies state
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
  });

  // Regions state
  const [regions, setRegions] = useState<any[]>([]);
  const [regionForm, setRegionForm] = useState({
    name: '',
    companyId: '',
    managerId: '',
  });

  // Warehouses state
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    regionId: '',
    address: '',
    capacity: '',
  });

  useEffect(() => {
    loadData();
  }, [token, activeTab]);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'companies':
          const companiesResponse = await organizationsApi.listCompanies();
          setCompanies(Array.isArray(companiesResponse) ? companiesResponse : companiesResponse.data || []);
          break;
        case 'regions':
          const regionsResponse = await organizationsApi.listRegions();
          setRegions(Array.isArray(regionsResponse) ? regionsResponse : regionsResponse.data || []);
          break;
        case 'warehouses':
          const warehousesResponse = await organizationsApi.listWarehouses();
          setWarehouses(Array.isArray(warehousesResponse) ? warehousesResponse : warehousesResponse.data || []);
          break;
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    resetForms();
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'companies':
        setCompanyForm({
          name: item.name || '',
          taxId: item.taxId || '',
          address: item.address || '',
          phone: item.phone || '',
          email: item.email || '',
        });
        break;
      case 'regions':
        setRegionForm({
          name: item.name || '',
          companyId: item.companyId || '',
          managerId: item.managerId || '',
        });
        break;
      case 'warehouses':
        setWarehouseForm({
          name: item.name || '',
          regionId: item.regionId || '',
          address: item.address || '',
          capacity: String(item.capacity || ''),
        });
        break;
    }
    setShowModal(true);
  };

  const resetForms = () => {
    setCompanyForm({ name: '', taxId: '', address: '', phone: '', email: '' });
    setRegionForm({ name: '', companyId: '', managerId: '' });
    setWarehouseForm({ name: '', regionId: '', address: '', capacity: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      switch (activeTab) {
        case 'companies':
          if (editingItem) {
            await organizationsApi.updateCompany(editingItem.id, companyForm);
          } else {
            await organizationsApi.createCompany(companyForm);
          }
          break;
        case 'regions':
          await organizationsApi.createRegion(regionForm);
          break;
        case 'warehouses':
          await organizationsApi.createWarehouse({
            ...warehouseForm,
            capacity: parseInt(warehouseForm.capacity) || 0,
          });
          break;
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    if (!token) return;

    try {
      // Mock delete - in real app, call API
      alert('Silindi');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'companies', label: 'Şirketler' },
    { id: 'regions', label: 'Bölgeler' },
    { id: 'warehouses', label: 'Depolar' },
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
        <h2 className="text-2xl font-bold">Organizasyonlar</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} />
          Yeni {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'companies' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vergi No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                </>
              )}
              {activeTab === 'regions' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yönetici</th>
                </>
              )}
              {activeTab === 'warehouses' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depo Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasite</th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeTab === 'companies' && companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.taxId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(company)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'regions' && regions.map((region) => (
              <tr key={region.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{region.company?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{region.manager?.firstName} {region.manager?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(region)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(region.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {activeTab === 'warehouses' && warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.region?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(warehouse)} className="text-gray-600 hover:text-gray-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(warehouse.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Düzenle' : 'Yeni Oluştur'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'companies' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                    <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                    <input type="text" value={companyForm.taxId} onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input type="text" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'regions' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bölge Adı</label>
                    <input type="text" value={regionForm.name} onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket</label>
                    <select value={regionForm.companyId} onChange={(e) => setRegionForm({ ...regionForm, companyId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                      <option value="">Şirket seçin</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'warehouses' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Depo Adı</label>
                    <input type="text" value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bölge</label>
                    <select value={warehouseForm.regionId} onChange={(e) => setWarehouseForm({ ...warehouseForm, regionId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                      <option value="">Bölge seçin</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea value={warehouseForm.address} onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
                    <input type="number" value={warehouseForm.capacity} onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {editingItem ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
