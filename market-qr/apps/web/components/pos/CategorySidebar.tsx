'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { categoriesApi } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

interface CategorySidebarProps {
  storeId: string;
  activeCategory: string;
  onSelect: (id: string) => void;
  productCounts: Record<string, number>;
  totalCount: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  'cat-gida': '🍞',
  'cat-icecek': '🥤',
  'cat-temizlik': '🧹',
};

export default function CategorySidebar({ activeCategory, onSelect, productCounts, totalCount }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('[CategorySidebar] Loading categories...');
      const res = await categoriesApi.list();
      console.log('[CategorySidebar] API response:', res);
      const list = Array.isArray(res) ? res : res.data || res.value || [];
      console.log('[CategorySidebar] Parsed categories:', list);
      setCategories(list);
    } catch (e) {
      console.error('Categories load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-[90px] bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-[90px] bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-2 py-2 border-b border-gray-100 flex items-center justify-center gap-1">
        <LayoutGrid size={12} className="text-gray-400" />
        <span className="text-[9px] font-semibold text-gray-500 uppercase">Kategori</span>
      </div>

      <div className="flex-1 overflow-auto py-1">
        <button
          onClick={() => onSelect('all')}
          className={`w-full flex flex-col items-center justify-center py-3 px-1 transition-all ${
            activeCategory === 'all'
              ? 'bg-primary-50 border-r-2 border-primary-500'
              : 'hover:bg-gray-50'
          }`}
        >
          <span className="text-2xl mb-1">📋</span>
          <span className={`text-[10px] font-bold leading-tight ${activeCategory === 'all' ? 'text-primary-700' : 'text-gray-600'}`}>
            Tümü
          </span>
          <span className={`text-[9px] mt-0.5 ${activeCategory === 'all' ? 'text-primary-500' : 'text-gray-400'}`}>
            {totalCount}
          </span>
        </button>

        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat.id] || '📦';
          const count = productCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex flex-col items-center justify-center py-3 px-1 transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-50 border-r-2 border-primary-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1">{icon}</span>
              <span className={`text-[10px] font-bold leading-tight ${activeCategory === cat.id ? 'text-primary-700' : 'text-gray-600'}`}>
                {cat.name}
              </span>
              <span className={`text-[9px] mt-0.5 ${activeCategory === cat.id ? 'text-primary-500' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
