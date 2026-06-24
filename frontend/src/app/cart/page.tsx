'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>カートは空です</p>
        <Link href="/">
          <button style={{ background: '#2563eb', color: '#fff' }}>書籍一覧へ</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>カート</h1>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {items.map((item, idx) => (
          <div key={item.book.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
            borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
            <img src={item.book.image_url} alt={item.book.title} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>{item.book.title}</p>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>{item.book.author}</p>
              <p style={{ color: '#2563eb', fontWeight: 700 }}>¥{item.book.price.toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => updateQuantity(item.book.id, item.quantity - 1)} style={{ background: '#e5e7eb', color: '#333', padding: '0.3rem 0.7rem' }}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.book.id, item.quantity + 1)} style={{ background: '#e5e7eb', color: '#333', padding: '0.3rem 0.7rem' }}>＋</button>
            </div>
            <p style={{ minWidth: 80, textAlign: 'right', fontWeight: 600 }}>
              ¥{(item.book.price * item.quantity).toLocaleString()}
            </p>
            <button onClick={() => removeItem(item.book.id)} style={{ background: '#fee2e2', color: '#dc2626', padding: '0.3rem 0.7rem' }}>削除</button>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#666' }}>合計</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>¥{total.toLocaleString()}</p>
        </div>
        <Link href="/order">
          <button style={{ background: '#2563eb', color: '#fff', padding: '0.8rem 2rem', fontSize: '1rem' }}>
            注文へ進む
          </button>
        </Link>
      </div>
    </div>
  );
}
