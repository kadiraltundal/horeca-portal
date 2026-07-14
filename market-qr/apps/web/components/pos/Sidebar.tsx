'use client';

import { Home, Package, ShoppingCart, BarChart3, Warehouse, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'pos', label: 'Hızlı Satış', icon: Home },
  { id: 'products', label: 'Ürünler', icon: Package },
  { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
  { id: 'inventory', label: 'Stok', icon: Warehouse },
  { id: 'reports', label: 'Raporlar', icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  return (
    <div className="w-[60px] bg-pos-sidebar flex flex-col items-center py-3 gap-1 flex-shrink-0">
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mb-3">
        <span className="text-white font-bold text-lg">M</span>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-pos-sidebar-active text-white'
                  : 'text-slate-400 hover:bg-pos-sidebar-hover hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onLogout}
        title="Çıkış"
        className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-900/50 hover:text-red-400 transition-all"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
