import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import CartSummary from '../components/CartSummary';
import OrderForm from '../components/OrderForm';
import { createOrder } from '../services/order_api';

export default function OrderPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // カートが空の場合はカート画面へリダイレクト（FR-012）
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router]);

  if (items.length === 0) return null;

  async function handleSubmit({
    customerName,
    customerAddress,
    customerEmail,
  }: {
    customerName: string;
    customerAddress: string;
    customerEmail: string;
  }): Promise<void> {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const { order_number } = await createOrder(customerName, customerAddress, customerEmail, items);
      clearCart();
      router.push(`/order/complete?orderNumber=${encodeURIComponent(order_number)}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const e = err as { error?: string };
      setServerError(e.error ?? '注文の処理中にエラーが発生しました。再度お試しください。');
    }
  }

  return (
    <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>注文フォーム</h1>

      <section style={{ marginBottom: '32px' }}>
        <h2>注文内容の確認</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>書名</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>単価</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>数量</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>小計</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.bookId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{item.title}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>¥{item.unitPrice.toLocaleString()}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>¥{(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CartSummary totalAmount={totalAmount} />
      </section>

      <section>
        <h2>お届け先・連絡先の入力</h2>
        {serverError && <p style={{ color: 'red', marginBottom: '16px' }}>{serverError}</p>}
        <OrderForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </section>
    </div>
  );
}
