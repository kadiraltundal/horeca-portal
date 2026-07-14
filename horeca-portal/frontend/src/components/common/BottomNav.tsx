'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

const navItems = [
  {
    href: '/',
    label: 'Bosh sahifa',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-gray-400'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    href: '/categories',
    label: 'Kategoriyalar',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    href: '/cart',
    label: 'Savat',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    badge: true,
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-[500px] mx-auto grid grid-cols-4 gap-1 px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2 relative"
            >
              {item.icon(isActive)}
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-blue-500 font-medium' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {item.badge && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}