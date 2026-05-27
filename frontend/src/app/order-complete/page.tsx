'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '@/components/OrderSummary';
import type { LastOrderData } from '@/types';

export default function OrderCompletePage() {
  const [order, setOrder] = useState<LastOrderData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('lastOrder');
    if (!stored) {
      router.replace('/');
      return;
    }
    try {
      setOrder(JSON.parse(stored) as LastOrderData);
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!order) return null;

  const summaryItems = order.items.map((i) => ({
    title: i.title,
    quantity: i.quantity,
    subtotal: i.subtotal,
  }));

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ご注文ありがとうございます！
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        ご注文を受け付けました。
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 inline-block">
        <p className="text-xs text-blue-500 font-medium mb-0.5">注文番号</p>
        <p className="text-lg font-bold text-blue-700 tracking-wide">
          {order.orderId}
        </p>
      </div>

      <div className="text-left mb-8">
        <OrderSummary items={summaryItems} totalAmount={order.totalAmount} />
      </div>

      <Link
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm"
      >
        商品一覧へ戻る
      </Link>
    </div>
  );
}
