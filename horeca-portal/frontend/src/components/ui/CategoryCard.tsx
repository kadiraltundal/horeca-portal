'use client';

import Link from 'next/link';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  layout?: 'grid' | 'list';
}

export default function CategoryCard({ category, layout = 'grid' }: CategoryCardProps) {
  if (layout === 'list') {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
            {category.icon || '📁'}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{category.nameUz}</h3>
            {category.nameRu && (
              <p className="text-sm text-gray-500">{category.nameRu}</p>
            )}
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
        {category.icon || '📁'}
      </div>
      <h3 className="font-medium text-gray-900 text-sm">{category.nameUz}</h3>
      {category.children && category.children.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {category.children.length} ta alt kategoriya
        </p>
      )}
    </Link>
  );
}