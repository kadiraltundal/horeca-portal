'use client';

import { Settings, Store, User, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SettingsPageProps {
  storeId: string;
  storeName: string;
}

export default function SettingsPage({ storeId, storeName }: SettingsPageProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-xl shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Settings size={20} />
          Ayarlar
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Store Info */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Store size={16} />
            Mağaza Bilgileri
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Mağaza Adı</p>
              <p className="font-medium">{storeName}</p>
            </div>
            <div>
              <p className="text-gray-500">Mağaza ID</p>
              <p className="font-medium font-mono text-xs">{storeId}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User size={16} />
            Kullanıcı Bilgileri
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ad Soyad</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500">E-posta</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Rol</p>
              <p className="font-medium">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Bell size={16} />
            İşlemler
          </h3>
          <button
            onClick={() => {
              if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                logout();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}
