'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Header from '@/components/common/Header';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [data, countData] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote_status': return '📋';
      case 'price_change': return '💰';
      case 'campaign': return '🎉';
      case 'stock': return '📦';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'quote_status': return 'bg-blue-100';
      case 'price_change': return 'bg-green-100';
      case 'campaign': return 'bg-purple-100';
      case 'stock': return 'bg-yellow-100';
      case 'system': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    return date.toLocaleDateString('uz-UZ');
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Bildirishnomalar"
        showBackButton
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Barchasini o&apos;qilgan belgilash
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="Bildirishnomalar yo'q"
            description="Yangi bildirishnomalar shu yerda paydo bo'ladi"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                className={`bg-white rounded-xl p-4 shadow-sm transition-all ${
                  !notification.isRead
                    ? 'border-l-4 border-blue-500 cursor-pointer hover:shadow-md'
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}