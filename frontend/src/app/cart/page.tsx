'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>カートは空です。</p>
          <Link href="/" style={{ color: '#4a90e2' }}>← 書籍一覧へ</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>カート</h1>
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {items.map(item => (
            <div key={item.book.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.5rem', borderBottom: '1px solid #e9ecef',
            }}>
              <img
                src={item.book.image_url ?? 'https://placehold.co/60x84?text='}
                alt={item.book.title}
                style={{ width: '60px', height: '84px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.book.title}
                </p>
                <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>{item.book.author}</p>
                <p style={{ color: '#e74c3c', fontWeight: 700 }}>¥{item.book.price.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => updateQuantity(item.book.id, Math.max(1, item.quantity - 1))}
                  style={{ background: '#e9ecef', color: '#212529', width: '2rem', height: '2rem', padding: 0 }}
                >
                  −
                </button>
                <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                  style={{ background: '#e9ecef', color: '#212529', width: '2rem', height: '2rem', padding: 0 }}
                >
                  ＋
                </button>
              </div>
              <p style={{ minWidth: '6rem', textAlign: 'right', fontWeight: 600 }}>
                ¥{(item.book.price * item.quantity).toLocaleString()}
              </p>
              <button
                onClick={() => removeItem(item.book.id)}
                style={{ background: 'transparent', color: '#adb5bd', fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem' }}>
            <p style={{ fontSize: '1.1rem' }}>
              合計：<strong style={{ fontSize: '1.4rem', color: '#e74c3c' }}>¥{totalAmount.toLocaleString()}</strong>
            </p>
            <button
              onClick={() => router.push('/checkout')}
              style={{ background: '#e74c3c', color: '#fff', padding: '0.75rem 2rem', fontSize: '1rem' }}
            >
              注文手続きへ
            </button>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/" style={{ color: '#4a90e2', fontSize: '0.9rem' }}>← 書籍一覧に戻る</Link>
        </div>
      </main>
    </>
  );
}
