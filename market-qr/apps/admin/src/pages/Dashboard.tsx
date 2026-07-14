import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, QrCode, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, storesApi, ordersApi } from '../lib/api';

export default function Dashboard() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    if (!token) return;

    try {
      const storesResponse = await storesApi.list();
      const stores = Array.isArray(storesResponse) ? storesResponse : storesResponse.data || [];

      if (stores.length > 0) {
        const sid = stores[0].id;

        try {
          const overviewData = await dashboardApi.getOverview(sid);
          setOverview(overviewData);
        } catch (e) {
          console.error('Overview error:', e);
        }

        try {
          const ordersResponse = await ordersApi.list(sid, 1, 5);
          setRecentOrders(ordersResponse.data || []);
        } catch (e) {
          console.error('Orders error:', e);
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Toplam Ürün', value: overview?.totalProducts || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Aktif QR Kod', value: overview?.activeQrCodes || 0, icon: QrCode, color: 'bg-indigo-500' },
    { label: 'Bugünkü Tarama', value: overview?.todayScans || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Bugünkü Sipariş', value: overview?.todayOrders || 0, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Ay Tarama', value: overview?.monthScans || 0, icon: TrendingUp, color: 'bg-cyan-500' },
    { label: 'Ay Sipariş', value: overview?.monthOrders || 0, icon: ShoppingCart, color: 'bg-emerald-500' },
    { label: 'Toplam Gelir', value: `₺${(overview?.totalRevenue || 0).toLocaleString('tr-TR')}`, icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Düşük Stok', value: overview?.lowStockAlerts?.length || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className={`${stat.color} p-2 rounded-lg text-white`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Son Siparişler</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz sipariş yok</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Sipariş #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{order.totalAmount?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'COMPLETED' ? 'Tamamlandı' :
                       order.status === 'PENDING' ? 'Bekliyor' :
                       order.status === 'PAID' ? 'Ödendi' :
                       order.status === 'CANCELLED' ? 'İptal' : order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Düşük Stok Uyarıları</h3>
          <div className="space-y-3">
            {!overview?.lowStockAlerts || overview.lowStockAlerts.length === 0 ? (
              <p className="text-gray-500 text-sm">Düşük stok uyarısı yok</p>
            ) : (
              overview.lowStockAlerts.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">Raf: {item.shelfNumber || '-'}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {item.stockQuantity} adet kaldı
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {overview?.expiringSoon && overview.expiringSoon.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Yaklaşan SKT'ler</h3>
            <div className="space-y-3">
              {overview.expiringSoon.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">Parti: {item.batchNumber}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {new Date(item.expiryDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
