'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { ordersApi, dashboardApi } from '@/lib/api';

interface DashboardStats {
  todayOrders: number;
  monthOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockAlerts: any[];
}

interface ReportsPageProps {
  storeId: string;
}

export default function ReportsPage({ storeId }: ReportsPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [storeId]);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getOverview(storeId);
      setStats(data);
    } catch (e) {
      console.error('Stats load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Raporlar yükleniyor...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Veri yüklenemedi</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-xl shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 size={20} />
          Raporlar
        </h2>
      </div>

      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={18} className="opacity-80" />
            <span className="text-sm opacity-80">Bugünkü Sipariş</span>
          </div>
          <p className="text-3xl font-bold">{stats.todayOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="opacity-80" />
            <span className="text-sm opacity-80">Aylık Sipariş</span>
          </div>
          <p className="text-3xl font-bold">{stats.monthOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="opacity-80" />
            <span className="text-sm opacity-80">Toplam Gelir</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="opacity-80" />
            <span className="text-sm opacity-80">Toplam Ürün</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>
      </div>

      {stats.lowStockAlerts.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Düşük Stok Uyarıları
          </h3>
          <div className="bg-yellow-50 rounded-lg p-4">
            {stats.lowStockAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between py-2 border-b border-yellow-200 last:border-0">
                <span className="font-medium text-sm">{alert.product?.name}</span>
                <span className="text-sm text-yellow-700">{alert.stockQuantity} adet kaldı</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
