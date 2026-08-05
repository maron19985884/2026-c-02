import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreateOrderResponse } from '@/services/apiClient';
import { OrderCompleteMessage } from '@/components/OrderCompleteMessage';

/** 注文完了画面（U-16〜U-18 / FR-016〜FR-018） */
export default function OrderCompletePage() {
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder');
    if (raw) {
      setOrder(JSON.parse(raw) as CreateOrderResponse);
    }
  }, []);

  return (
    <main>
      <h1>注文完了</h1>
      <OrderCompleteMessage order={order} />
      <Link href="/">商品一覧へ戻る</Link>
    </main>
  );
}
