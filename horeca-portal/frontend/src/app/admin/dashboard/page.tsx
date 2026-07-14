'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  users: { totalUsers: number; activeUsers: number; adminCount: number };
  products: { totalProducts: number; activeProducts: number; outOfStock: number };
  categories: { totalCategories: number; activeCategories: number };
  brands: { totalBrands: number; activeBrands: number };
  quotes: { totalQuotes: number; pendingQuotes: number; completedQuotes: number; totalAmount: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  if (!stats) {
    return <div className="text-center py-12">Dashboard yuklanmadi</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Foydalanuvchilar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.totalUsers}</p>
              <p className="text-xs text-green-600">{stats.users.activeUsers} faol</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mahsulotlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.products.totalProducts}</p>
              {stats.products.outOfStock > 0 && (
                <p className="text-xs text-red-600">{stats.products.outOfStock} stokda yo'q</p>
              )}
            </div>
          </div>
        </div>

        {/* Quotes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teklifler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.quotes.totalQuotes}</p>
              <p className="text-xs text-yellow-600">{stats.quotes.pendingQuotes} kutilmoqda</p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jami Summa</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.quotes.totalAmount)}
              </p>
              <p className="text-xs text-green-600">{stats.quotes.completedQuotes} tamamlandi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tez harakatlar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <span className="text-3xl">➕</span>
            <span className="text-sm font-medium text-blue-700">Yangi mahsulot</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <span className="text-3xl">📦</span>
            <span className="text-sm font-medium text-green-700">Mahsulotlar</span>
          </Link>
          <Link
            href="/admin/quotes"
            className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
          >
            <span className="text-3xl">📋</span>
            <span className="text-sm font-medium text-yellow-700">Teklifler</span>
          </Link>
          <Link
            href="/admin/campaigns"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <span className="text-3xl">🎉</span>
            <span className="text-sm font-medium text-purple-700">Kampanyalar</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm text-gray-500 mb-2">Kategoriyalar</h4>
          <p className="text-xl font-bold text-gray-900">{stats.categories.totalCategories}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm text-gray-500 mb-2">Markalar</h4>
          <p className="text-xl font-bold text-gray-900">{stats.brands.totalBrands}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm text-gray-500 mb-2">Admin Sayısı</h4>
          <p className="text-xl font-bold text-gray-900">{stats.users.adminCount}</p>
        </div>
      </div>
    </div>
  );
}