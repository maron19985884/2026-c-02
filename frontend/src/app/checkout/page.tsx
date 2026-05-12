'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { postOrder } from '@/api/client';
import Header from '@/components/Header';

interface FormErrors {
  customer_name?: string;
  customer_address?: string;
  customer_email?: string;
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customer_name: '', customer_address: '', customer_email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.customer_name.trim()) e.customer_name = '氏名を入力してください';
    if (!form.customer_address.trim()) e.customer_address = '住所を入力してください';
    if (!form.customer_email.trim()) e.customer_email = 'メールアドレスを入力してください';
    else if (!validateEmail(form.customer_email)) e.customer_email = 'メールアドレスの形式が正しくありません';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      const order = await postOrder({
        ...form,
        items: items.map(i => ({ book_id: i.book.id, quantity: i.quantity, unit_price: i.book.price })),
      });
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : '注文に失敗しました');
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>カートが空のため注文できません。</p>
          <Link href="/" style={{ color: '#4a90e2' }}>← 書籍一覧へ</Link>
        </main>
      </>
    );
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
        {label} <span style={{ color: '#e74c3c' }}>*</span>
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ borderColor: errors[key] ? '#e74c3c' : '' }}
      />
      {errors[key] && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <Header />
      <main className="container">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>注文フォーム</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* 左：入力フォーム */}
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>お客様情報</h2>
            {field('氏名', 'customer_name')}
            {field('住所', 'customer_address')}
            {field('メールアドレス', 'customer_email', 'email')}
            {apiError && <p style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '0.9rem' }}>{apiError}</p>}
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', background: '#e74c3c', color: '#fff', padding: '0.8rem', fontSize: '1rem' }}
            >
              {submitting ? '送信中...' : '注文する'}
            </button>
          </form>

          {/* 右：注文内容確認 */}
          <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>注文内容</h2>
            {items.map(item => (
              <div key={item.book.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ flex: 1, marginRight: '1rem' }}>{item.book.title} × {item.quantity}</span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>¥{(item.book.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e9ecef', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>合計</span>
              <span style={{ fontWeight: 700, color: '#e74c3c', fontSize: '1.2rem' }}>¥{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Link href="/cart" style={{ color: '#4a90e2', fontSize: '0.9rem' }}>← カートに戻る</Link>
        </div>
      </main>
    </>
  );
}
