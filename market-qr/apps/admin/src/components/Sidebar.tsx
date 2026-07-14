import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Store,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  RotateCcw,
  Wallet,
  FileText,
  LogOut,
  Megaphone,
  Users as UsersIcon,
  DollarSign,
  BarChart3,
  UserCheck,
  Building2,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Genel',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    title: 'Ürün & Envanter',
    items: [
      { to: '/products', icon: Package, label: 'Ürünler' },
      { to: '/categories', icon: Tags, label: 'Kategoriler' },
      { to: '/inventory', icon: Warehouse, label: 'Stok Yönetimi' },
      { to: '/stock-movements', icon: ArrowLeftRight, label: 'Stok Hareketleri' },
      { to: '/batches', icon: Package, label: 'Partiler' },
    ],
  },
  {
    title: 'Tedarik & Satın Alma',
    items: [
      { to: '/suppliers', icon: Truck, label: 'Tedarikçiler' },
      { to: '/purchase-orders', icon: ClipboardList, label: 'Satın Alma' },
    ],
  },
  {
    title: 'Satış & Sipariş',
    items: [
      { to: '/orders', icon: ShoppingCart, label: 'Siparişler' },
      { to: '/refunds', icon: RotateCcw, label: 'İadeler' },
      { to: '/ecommerce', icon: ShoppingCart, label: 'E-Ticaret' },
    ],
  },
  {
    title: 'Finans',
    items: [
      { to: '/finance', icon: DollarSign, label: 'Finans' },
      { to: '/cash-drawer', icon: Wallet, label: 'Kasa' },
      { to: '/z-reports', icon: FileText, label: 'Gün Sonu Raporları' },
    ],
  },
  {
    title: 'Depo & Lojistik',
    items: [
      { to: '/warehouse-management', icon: Warehouse, label: 'Depo Yönetimi' },
    ],
  },
  {
    title: 'Müşteriler & Sadakat',
    items: [
      { to: '/customers', icon: UserCheck, label: 'Müşteriler' },
      { to: '/loyalty', icon: Award, label: 'Sadakat' },
    ],
  },
  {
    title: 'İçerik & Organizasyon',
    items: [
      { to: '/cms', icon: FileText, label: 'İçerik Yönetimi' },
      { to: '/organizations', icon: Building2, label: 'Organizasyon' },
    ],
  },
  {
    title: 'Yönetim',
    items: [
      { to: '/stores', icon: Store, label: 'Mağazalar' },
      { to: '/promotions', icon: Megaphone, label: 'Promosyonlar' },
      { to: '/reports', icon: BarChart3, label: 'Raporlar' },
      { to: '/staff', icon: UsersIcon, label: 'Personel' },
      { to: '/users', icon: UsersIcon, label: 'Kullanıcılar' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Market QR</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
