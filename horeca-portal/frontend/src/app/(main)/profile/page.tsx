'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { useTelegram } from '@/hooks/useTelegram';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { user: tgUser } = useTelegram();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.slice(0, 5));
      const count = await api.getUnreadCount();
      setUnreadCount(count.count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Profil</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* User Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600">
                {user?.firstName?.[0] || tgUser?.first_name?.[0] || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.firstName || tgUser?.first_name} {user?.lastName || tgUser?.last_name}
              </h2>
              {user?.company && (
                <p className="text-sm text-gray-500">{user.company}</p>
              )}
              {user?.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Yangi bildirishnoma yo'q</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2 rounded ${
                    notif.isRead ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Sozlamalar</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Tilni o'zgartirish</span>
              <span className="text-gray-400">{user?.language === 'uz' ? "O'zbekcha" : 'Русский'}</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Bildirishnomalar</span>
              <span className="text-gray-400">{'>'}</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          Chiqish
        </button>

        {/* Version */}
        <p className="text-center text-xs text-gray-400">HORECA Portal v1.0.0</p>
      </div>
    </div>
  );
}