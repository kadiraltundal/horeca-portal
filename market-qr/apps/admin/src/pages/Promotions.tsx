import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { promotionsApi } from '../lib/api';

export default function Promotions() {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'promotions' | 'coupons'>('promotions');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    targetCategoryId: '',
    usageLimit: '',
  });
  const [couponForm, setCouponForm] = useState({
    code: '',
    promotionId: '',
    usageLimit: '1',
    minAmount: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [promoResponse, couponResponse] = await Promise.all([
        promotionsApi.list(),
        promotionsApi.listCoupons(),
      ]);
      setPromotions(Array.isArray(promoResponse) ? promoResponse : promoResponse.data || []);
      setCoupons(Array.isArray(couponResponse) ? couponResponse : couponResponse.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      title: '', description: '', discountType: 'PERCENTAGE',
      discountValue: '', startDate: '', endDate: '', targetCategoryId: '', usageLimit: '',
    });
    setShowModal(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title || '',
      description: promo.description || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: String(promo.discountValue || ''),
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      targetCategoryId: promo.targetCategoryId || '',
      usageLimit: String(promo.usageLimit || ''),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetCategoryId: formData.targetCategoryId || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      };

      if (editingPromo) {
        await promotionsApi.update(editingPromo.id, data);
      } else {
        await promotionsApi.create(data);
      }
      setShowModal(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu promosyonu silmek istediğinize emin misiniz?')) return;
    try {
      await promotionsApi.delete(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await promotionsApi.toggleActive(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await promotionsApi.createCoupon({
        code: couponForm.code,
        promotionId: couponForm.promotionId,
        usageLimit: parseInt(couponForm.usageLimit) || 1,
        minAmount: couponForm.minAmount ? parseFloat(couponForm.minAmount) : undefined,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : undefined,
      });
      setShowCouponModal(false);
      setCouponForm({ code: '', promotionId: '', usageLimit: '1', minAmount: '', expiresAt: '' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Kupon oluşturulamadı');
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
        <h2 className="text-2xl font-bold">Promosyonlar & Kuponlar</h2>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'promotions' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Promosyonlar
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'coupons' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Kuponlar
            </button>
          </div>
          {activeTab === 'promotions' ? (
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Plus size={20} />
              Yeni Promosyon
            </button>
          ) : (
            <button
              onClick={() => {
                setCouponForm({ code: '', promotionId: promotions[0]?.id || '', usageLimit: '1', minAmount: '', expiresAt: '' });
                setShowCouponModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Tag size={20} />
              Yeni Kupon
            </button>
          )}
        </div>
      </div>

      {activeTab === 'promotions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İndirim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih Aralığı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Promosyon bulunamadı</td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{promo.title}</div>
                      {promo.description && <div className="text-xs text-gray-500">{promo.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promo.discountType === 'PERCENTAGE' ? `%${promo.discountValue}` : `₺${promo.discountValue}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promo.startDate).toLocaleDateString('tr-TR')} - {new Date(promo.endDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promo.usedCount || 0} / {promo.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggle(promo.id)} className="flex items-center">
                        {promo.isActive ? (
                          <ToggleRight size={24} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={24} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(promo)} className="text-gray-600 hover:text-gray-900">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promosyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Kupon bulunamadı</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.promotion?.title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.usedCount} / {coupon.usageLimit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.minAmount ? `₺${coupon.minAmount}` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('tr-TR') : 'Süresiz'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingPromo ? 'Promosyon Düzenle' : 'Yeni Promosyon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tipi</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="PERCENTAGE">Yüzde (%)</option>
                    <option value="FIXED">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Değer</label>
                  <input type="number" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım Limiti</label>
                <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Sınırsız" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingPromo ? 'Güncelle' : 'Oluştur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Kupon Oluştur</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu</label>
                <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promosyon</label>
                <select value={couponForm.promotionId} onChange={(e) => setCouponForm({ ...couponForm, promotionId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                  <option value="">Promosyon seçin</option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım Limiti</label>
                  <input type="number" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Tutar (₺)</label>
                  <input type="number" step="0.01" value={couponForm.minAmount} onChange={(e) => setCouponForm({ ...couponForm, minAmount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input type="date" value={couponForm.expiresAt} onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}