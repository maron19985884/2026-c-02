'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          📚 本のお店
        </Link>

        <Link
          href="/cart"
          aria-label={`カート（${totalCount}冊）`}
          className="relative flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          <span className="text-sm font-medium">カート</span>
          <span
            className={`absolute -top-2 -right-2 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
              totalCount > 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {totalCount}
          </span>
        </Link>
      </div>
    </header>
  );
}
