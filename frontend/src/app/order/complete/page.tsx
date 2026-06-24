'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CompleteContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order_number');
  const total = Number(params.get('total'));

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>ご注文ありがとうございます</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>注文が確定しました</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>注文番号</p>
        <p style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.05em', color: '#2563eb', marginBottom: '1rem' }}>{orderNumber}</p>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>合計金額</p>
        <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>¥{total.toLocaleString()}</p>
      </div>

      <Link href="/">
        <button style={{ background: '#2563eb', color: '#fff', padding: '0.8rem 2rem', fontSize: '1rem' }}>
          書籍一覧へ戻る
        </button>
      </Link>
    </div>
  );
}

export default function OrderComplete() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <CompleteContent />
    </Suspense>
  );
}
