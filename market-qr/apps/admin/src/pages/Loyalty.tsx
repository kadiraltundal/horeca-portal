import { useEffect, useState } from 'react';
import { Plus, Gift, TrendingUp, Users, Star, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Loyalty() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);

  // Summary stats
  const [summary, setSummary] = useState({
    totalPoints: 0,
    activeCustomers: 0,
    tierDistribution: {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
  });

  // Rewards catalog
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    category: '',
    isActive: true,
  });

  // Recent transactions
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      // Mock data - in real app, fetch from API
      setSummary({
        totalPoints: 125000,
        activeCustomers: 1250,
        tierDistribution: {
          bronze: 800,
          silver: 300,
          gold: 120,
          platinum: 30,
        },
      });

      setRewards([
        { id: '1', name: '10₺ İndirim', description: '10 TL indirim kuponu', pointsRequired: 1000, category: 'İndirim', isActive: true },
        { id: '2', name: 'Ücretsiz Kargo', description: 'Bir sonraki siparişte ücretsiz kargo', pointsRequired: 500, category: 'Kargo', isActive: true },
        { id: '3', name: 'Hediye Ürün', description: 'Seçili ürünlerden hediye', pointsRequired: 2000, category: 'Hediye', isActive: true },
        { id: '4', name: 'VIP Erişim', description: 'Özel etkinliklere erişim', pointsRequired: 5000, category: 'Özel', isActive: false },
      ]);

      setTransactions([
        { id: '1', customer: 'Ahmet Yılmaz', type: 'EARN', points: 150, description: 'Sipariş #12345', date: '2024-01-20' },
        { id: '2', customer: 'Mehmet Kaya', type: 'REDEEM', points: -1000, description: '10₺ İndirim Kuponu', date: '2024-01-19' },
        { id: '3', customer: 'Ayşe Demir', type: 'EARN', points: 250, description: 'Sipariş #12346', date: '2024-01-18' },
        { id: '4', customer: 'Fatma Çelik', type: 'BONUS', points: 500, description: 'Doğum Günü Bonusu', date: '2024-01-17' },
      ]);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingReward(null);
    setRewardForm({ name: '', description: '', pointsRequired: '', category: '', isActive: true });
    setShowRewardModal(true);
  };

  const openEditModal = (reward: any) => {
    setEditingReward(reward);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      pointsRequired: String(reward.pointsRequired || ''),
      category: reward.category || '',
      isActive: reward.isActive ?? true,
    });
    setShowRewardModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      // Mock save - in real app, call API
      alert(editingReward ? 'Ödül güncellendi' : 'Ödül oluşturuldu');
      setShowRewardModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Bu ödülü silmek istediğinize emin misiniz?')) return;
    if (!token) return;

    try {
      // Mock delete - in real app, call API
      alert('Ödül silindi');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'EARN': return 'bg-green-100 text-green-800';
      case 'REDEEM': return 'bg-red-100 text-red-800';
      case 'BONUS': return 'bg-blue-100 text-blue-800';
      case 'EXPIRE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'EARN': return 'Kazanıldı';
      case 'REDEEM': return 'Kullanıldı';
      case 'BONUS': return 'Bonus';
      case 'EXPIRE': return 'Süresi Doldu';
      default: return type;
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
        <h2 className="text-2xl font-bold">Sadakat Programı</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} />
          Yeni Ödül
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Toplam Puan</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalPoints.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Aktif Müşteri</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeCustomers.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Star className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Bronz Üye</p>
              <p className="text-2xl font-bold text-gray-900">{summary.tierDistribution.bronze}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Gift className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Platin Üye</p>
              <p className="text-2xl font-bold text-gray-900">{summary.tierDistribution.platinum}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rewards Catalog */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ödül Kataloğu</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödül</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                      <div className="text-xs text-gray-500">{reward.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reward.pointsRequired.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reward.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(reward)} className="text-gray-600 hover:text-gray-900">
                          <Gift size={16} />
                        </button>
                        <button onClick={() => handleDelete(reward.id)} className="text-red-600 hover:text-red-900">
                          <Gift size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Son İşlemler</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.customer}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={transaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingReward ? 'Ödül Düzenle' : 'Yeni Ödül'}
              </h3>
              <button onClick={() => setShowRewardModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ödül Adı</label>
                <input
                  type="text"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gerekli Puan</label>
                  <input
                    type="number"
                    value={rewardForm.pointsRequired}
                    onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={rewardForm.category}
                    onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    <option value="İndirim">İndirim</option>
                    <option value="Kargo">Kargo</option>
                    <option value="Hediye">Hediye</option>
                    <option value="Özel">Özel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={rewardForm.isActive.toString()}
                  onChange={(e) => setRewardForm({ ...rewardForm, isActive: e.target.value === 'true' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingReward ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
