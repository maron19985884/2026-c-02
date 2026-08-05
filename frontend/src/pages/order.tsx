import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { OrderForm } from '@/components/OrderForm';
import { createOrder } from '@/services/apiClient';
import { itemSubtotal } from '@/lib/cart';
import { OrderFormValues } from '@/lib/validation';

/** 注文フォーム画面（U-12〜U-15 / FR-012〜FR-015） */
export default function OrderPage() {
  const router = useRouter();
  const { items, totalAmount } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: OrderFormValues) {
    const result = await createOrder({
      ...values,
      items: items.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
    });

    if (result.ok) {
      sessionStorage.setItem('lastOrder', JSON.stringify(result.data));
      router.push('/order-complete');
    } else {
      setSubmitError('入力内容をご確認ください。');
    }
  }

  return (
    <main>
      <h1>注文フォーム</h1>
      <section>
        <h2>注文内容</h2>
        <ul>
          {items.map((item) => (
            <li key={item.bookId}>
              {item.title} × {item.quantity} = {itemSubtotal(item)}円
            </li>
          ))}
        </ul>
        <p>合計金額: {totalAmount}円</p>
      </section>
      <OrderForm onSubmit={handleSubmit} submitError={submitError} />
    </main>
  );
}
