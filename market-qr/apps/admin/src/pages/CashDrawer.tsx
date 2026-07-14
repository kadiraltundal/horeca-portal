import { useState, useEffect } from 'react';
import { Wallet, Lock, Unlock, History } from 'lucide-react';
import { cashDrawerApi, storesApi } from '../lib/api';

interface CashDrawerData {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  status: string;
  openedAt: string;
  closedAt?: string;
  sales?: {
    cash: { total: number; count: number };
    card: { total: number; count: number };
  };
}

interface Store {
  id: string;
  name: string;
}

interface DrawerHistory {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  status: string;
  openedAt: string;
  closedAt?: string;
  user?: { firstName: string; lastName: string };
}

export default function CashDrawer() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [openDrawer, setOpenDrawer] = useState<CashDrawerData | null>(null);
  const [history, setHistory] = useState<DrawerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');

  useEffect(() => {
    storesApi.list().then((data) => {
      const list = data.data || data;
      setStores(Array.isArray(list) ? list : []);
      if (list.length > 0) setSelectedStore(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStore) loadDrawer();
  }, [selectedStore]);

  const loadDrawer = async () => {
    try {
      setLoading(true);
      const drawer = await cashDrawerApi.getOpen(selectedStore);
      setOpenDrawer(drawer);
      const hist = await cashDrawerApi.getHistory(selectedStore, 1, 10);
      setHistory(hist.data);
    } catch (err) {
      setOpenDrawer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cashDrawerApi.open({
        storeId: selectedStore,
        openingBalance: Number(openingBalance),
      });
      setShowOpenModal(false);
      setOpeningBalance('');
      loadDrawer();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cashDrawerApi.close({
        storeId: selectedStore,
        userId: '', // Will be set by backend from JWT
        closingBalance: Number(closingBalance),
      });
      setShowCloseModal(false);
      setClosingBalance('');
      loadDrawer();
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kasa Yönetimi</h1>
          <p className="text-gray-500">Gün sonu kasa işlemlerini yönetin</p>
        </div>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : (
        <>
          {/* Open Drawer Status */}
          <div className="mb-6">
            {openDrawer ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Unlock size={32} className="text-green-600" />
                    <div>
                      <h2 className="text-lg font-bold text-green-800">Kasa Açık</h2>
                      <p className="text-sm text-green-600">
                        Açılış: {new Date(openDrawer.openedAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                  >
                    <Lock size={20} /> Kapat
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500">Açılış Bakiyesi</p>
                    <p className="text-xl font-bold">
                      {openDrawer.openingBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500">Nakit Satış</p>
                    <p className="text-xl font-bold text-green-600">
                      {openDrawer.sales?.cash.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
                    </p>
                    <p className="text-xs text-gray-500">{openDrawer.sales?.cash.count || 0} işlem</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500">Kart Satış</p>
                    <p className="text-xl font-bold text-blue-600">
                      {openDrawer.sales?.card.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
                    </p>
                    <p className="text-xs text-gray-500">{openDrawer.sales?.card.count || 0} işlem</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-700 mb-2">Kasa Kapalı</h2>
                <p className="text-gray-500 mb-4">Bugün için kasa henüz açılmamış</p>
                <button
                  onClick={() => setShowOpenModal(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 mx-auto"
                >
                  <Unlock size={20} /> Kasa Aç
                </button>
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <History size={20} /> Kasa Geçmişi
            </h3>
            {history.length === 0 ? (
              <p className="text-gray-500">Geçmiş kayıt yok</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kasiyer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Açılış</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kapanış</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(h.openedAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {h.user ? `${h.user.firstName} ${h.user.lastName}` : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {h.openingBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {h.closingBalance?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            h.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {h.status === 'OPEN' ? 'Açık' : 'Kapalı'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Open Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Kasa Aç</h2>
            <form onSubmit={handleOpen} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Açılış Bakiyesi *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Kasa Kapat</h2>
            <form onSubmit={handleClose} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Kapanış Bakiyesi *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
