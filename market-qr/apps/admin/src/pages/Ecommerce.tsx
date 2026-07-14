import { useEffect, useState } from 'react';
import { Plus, X, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const platformColors: Record<string, string> = {
  trendyol: 'bg-orange-100 text-orange-800',
  hepsiburada: 'bg-orange-600 text-white',
  n11: 'bg-yellow-100 text-yellow-800',
};

const syncStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  SUCCESS: { label: 'Başarılı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { label: 'Başarısız', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
};

type Tab = 'platformlar' | 'siparisler' | 'loglar';

export default function Ecommerce() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('platformlar');
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platformForm, setPlatformForm] = useState({
    name: '',
    type: '',
    apiKey: '',
    apiSecret: '',
    sellerId: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [platformsRes, ordersRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/ecommerce/platforms`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/ecommerce/orders`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/ecommerce/sync-logs`, { headers }).then(r => r.json()),
      ]);
      setPlatforms(Array.isArray(platformsRes) ? platformsRes : platformsRes.data || []);
      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes.data || []);
      setSyncLogs(Array.isArray(logsRes) ? logsRes : logsRes.data || []);
    } catch (error) {
      console.error('Ecommerce load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await fetch(`${API_URL}/ecommerce/platforms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(platformForm),
      });
      setShowPlatformModal(false);
      setPlatformForm({ name: '', type: '', apiKey: '', apiSecret: '', sellerId: '' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Platform oluşturulamadı');
    }
  };

  const handleSync = async (platformId: string) => {
    if (!token) return;
    setSyncing(platformId);
    try {
      await fetch(`${API_URL}/ecommerce/platforms/${platformId}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Senkronizasyon başarısız');
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    if (!token) return;
    setSyncing('all');
    try {
      await fetch(`${API_URL}/ecommerce/sync-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Toplu senkronizasyon başarısız');
    } finally {
      setSyncing(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'platformlar', label: 'Platformlar' },
    { key: 'siparisler', label: 'Platform Siparişleri' },
    { key: 'loglar', label: 'Senkronizasyon Logları' },
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
        <h2 className="text-2xl font-bold">E-Ticaret Yönetimi</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSyncAll}
            disabled={syncing === 'all'}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw size={20} className={syncing === 'all' ? 'animate-spin' : ''} />
            Tümünü Senkronize Et
          </button>
          <button
            onClick={() => setShowPlatformModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          >
            <Plus size={20} />
            Platform Ekle
          </button>
        </div>
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

      {/* Platformlar Tab */}
      {activeTab === 'platformlar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-8">Platform bulunamadı. Yeni platform ekleyin.</p>
          ) : (
            platforms.map((platform) => (
              <div key={platform.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink size={24} className="text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{platform.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${platformColors[platform.type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {platform.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Satıcı ID:</span>
                    <span className="font-medium">{platform.sellerId || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Son Senkron:</span>
                    <span className="font-medium">
                      {platform.lastSyncAt ? new Date(platform.lastSyncAt).toLocaleString('tr-TR') : 'Hiç'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ürün Sayısı:</span>
                    <span className="font-medium">{platform.productCount || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSync(platform.id)}
                  disabled={syncing === platform.id}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={syncing === platform.id ? 'animate-spin' : ''} />
                  {syncing === platform.id ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Siparişler Tab */}
      {activeTab === 'siparisler' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Sipariş bulunamadı</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${platformColors[order.platform?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {order.platform || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.platformOrderId || order.id?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName || order.customer?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Tamamlandı' : order.status === 'PENDING' ? 'Beklemede' : order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Loglar Tab */}
      {activeTab === 'loglar' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {syncLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Log bulunamadı</td></tr>
              ) : (
                syncLogs.map((log) => {
                  const statusInfo = syncStatusMap[log.status] || syncStatusMap.PENDING;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${platformColors[log.platform?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                          {log.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action || 'Senkronizasyon'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.message || log.details || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Platform Ekleme Modal */}
      {showPlatformModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Platform Ekle</h3>
              <button onClick={() => setShowPlatformModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlatform} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Adı</label>
                <input
                  type="text"
                  value={platformForm.name}
                  onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Örn: Mağazam Trendyol"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Türü</label>
                <select
                  value={platformForm.type}
                  onChange={(e) => setPlatformForm({ ...platformForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Platform seçin</option>
                  <option value="TRENDYOL">Trendyol</option>
                  <option value="HEPSIBURADA">Hepsiburada</option>
                  <option value="N11">n11</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satıcı ID</label>
                <input
                  type="text"
                  value={platformForm.sellerId}
                  onChange={(e) => setPlatformForm({ ...platformForm, sellerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={platformForm.apiKey}
                  onChange={(e) => setPlatformForm({ ...platformForm, apiKey: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                <input
                  type="password"
                  value={platformForm.apiSecret}
                  onChange={(e) => setPlatformForm({ ...platformForm, apiSecret: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowPlatformModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
