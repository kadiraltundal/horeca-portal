'use client';

import { Search, Tag, Percent, DollarSign, Eye } from 'lucide-react';

interface TopBarProps {
  storeName: string;
  total: number;
  itemCount: number;
  discount: { amount: number; description: string } | null;
  onCouponToggle: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  onApplyCoupon: () => void;
  couponInputVisible: boolean;
}

export default function TopBar({
  storeName, total, itemCount, discount,
  onCouponToggle, couponCode, setCouponCode, onApplyCoupon, couponInputVisible,
}: TopBarProps) {
  const quickActions = [
    { label: 'Bul', key: 'F6', icon: Search },
    { label: 'Fiyat Gör', key: null, icon: Eye },
    { label: 'Muhtelif', key: null, icon: Tag },
    { label: 'Satış Fiyat 1', key: null, icon: DollarSign },
    { label: 'Satış Fiyat 2', key: null, icon: DollarSign },
    { label: 'Satış Fiyat 3', key: null, icon: DollarSign },
    { label: 'Satış Fiyat 4', key: null, icon: DollarSign },
    { label: 'İskonto', key: null, icon: Percent, onClick: onCouponToggle },
  ];

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Left: Title + Store */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-pos-header whitespace-nowrap">Hızlı Satış</h1>
        <div className="h-6 w-px bg-gray-200" />
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 outline-none max-w-[200px]">
          <option>{storeName || 'Mağaza Seçin'}</option>
        </select>
      </div>

      {/* Center: Quick Actions + Coupon */}
      <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap active:scale-95 ${
                action.label === 'İskonto' && discount
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <Icon size={14} />
              {action.label}
              {action.key && <span className="pos-kbd ml-1">{action.key}</span>}
            </button>
          );
        })}

        {/* Coupon input */}
        {couponInputVisible && (
          <div className="flex items-center gap-1.5 ml-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
              placeholder="Kupon kodu"
              className="h-8 w-32 px-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            <button
              onClick={onApplyCoupon}
              className="h-8 px-3 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700"
            >
              Uygula
            </button>
            {discount && (
              <span className="text-xs text-green-600 font-semibold">
                -{discount.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Total */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Toplam</div>
          <div className="text-xl font-bold text-pos-success">
            {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 bg-pos-success rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{itemCount}</span>
          </div>
          <div className="w-8 h-8 bg-pos-info rounded-full flex items-center justify-center">
            <DollarSign size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
