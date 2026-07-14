'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, BarChart3, Settings, QrCode, Store, ArrowRight } from 'lucide-react';
import { storesApi } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const stores = await storesApi.list();
      const list = Array.isArray(stores) ? stores : stores.value || stores.data || [];
      if (list.length > 0) setStoreName(list[0].name);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30">
          <span className="text-white font-black text-3xl">M</span>
        </div>

        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Market QR
        </h1>
        <p className="text-gray-400 text-sm mb-1">Akıllı Market Yönetim Sistemi</p>
        {storeName && (
          <p className="text-primary-400 text-xs font-medium flex items-center gap-1.5 mb-8">
            <Store size={12} />
            {storeName}
          </p>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <Link
            href="/pos"
            className="group bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">Hızlı Satış</p>
              <p className="text-[10px] text-white/60 mt-0.5">POS ekranına git</p>
            </div>
            <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/pos"
            className="group bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">Ürünler</p>
              <p className="text-[10px] text-white/60 mt-0.5">Stok yönetimi</p>
            </div>
            <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/scan"
            className="group bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">QR Tara</p>
              <p className="text-[10px] text-white/60 mt-0.5">Ürün bilgisi al</p>
            </div>
            <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/pos"
            className="group bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">Raporlar</p>
              <p className="text-[10px] text-white/60 mt-0.5">Satış analizi</p>
            </div>
            <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-[10px] text-gray-500">Market QR v1.0 &copy; 2026</p>
      </div>
    </div>
  );
}
