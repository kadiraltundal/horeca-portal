'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { LogOut, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  storeName: string;
}

export default function Header({ storeName }: HeaderProps) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Market QR</h1>
        <span className="text-gray-400 text-sm">|</span>
        <span className="text-gray-300 text-sm">{storeName}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
          <ShoppingCart size={18} />
          <span className="text-sm">{itemCount} ürün</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
