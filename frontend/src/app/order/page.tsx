'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function OrderForm() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customer_name: '', address: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.address || !form.email) {
      setError('すべての項目を入力してください');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ book_id: i.book.id, quantity: i.quantity })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      clearCart();
      router.push(`/order/complete?order_number=${data.order_number}&total=${data.total_amount}`);
    } catch {
      setError('注文に失敗しました。もう一度お試しください。');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <p style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>カートに商品がありません</p>;
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>注文フォーム</h1>

      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>注文内容</h2>
        {items.map(i => (
          <div key={i.book.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>{i.book.title} × {i.quantity}</span>
            <span>¥{(i.book.price * i.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>合計</span>
          <span style={{ color: '#2563eb' }}>¥{total.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>お届け先情報</h2>

        {[
          { label: '氏名', key: 'customer_name', type: 'text', placeholder: '山田 太郎' },
          { label: '住所', key: 'address', type: 'text', placeholder: '東京都千代田区...' },
          { label: 'メールアドレス', key: 'email', type: 'email', placeholder: 'example@mail.com' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}

        {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: '#fff', width: '100%', padding: '0.8rem', fontSize: '1rem' }}>
          {submitting ? '送信中...' : '注文を確定する'}
        </button>
      </form>
    </div>
  );
}
