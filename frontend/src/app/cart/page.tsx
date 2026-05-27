'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/CartItemRow';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <h1 className="text-2xl font-bold text-gray-900">カート</h1>
        <p className="text-gray-500">カートに商品が入っていません。</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          商品一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">カート</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 mb-6">
        <ul>
          {items.map((item) => (
            <CartItemRow
              key={item.bookId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={remove}
            />
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">合計</span>
          <span className="text-2xl font-bold text-blue-600">
            ¥{totalAmount.toLocaleString('ja-JP')}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/checkout"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          注文手続きへ進む →
        </Link>
      </div>
    </div>
  );
}
