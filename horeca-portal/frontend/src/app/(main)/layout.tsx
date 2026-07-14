'use client';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import BottomNav from '@/components/common/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20">
        {children}
      </div>
      <BottomNav />
    </ProtectedRoute>
  );
}