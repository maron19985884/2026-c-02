import Link from 'next/link';
import { getOrder } from '@/api/client';
import Header from '@/components/Header';

interface Props { params: { id: string }; }

export default async function OrderCompletePage({ params }: Props) {
  let order;
  try {
    order = await getOrder(Number(params.id));
  } catch {
    return (
      <>
        <Header />
        <main className="container">
          <p style={{ color: '#e74c3c' }}>注文情報の取得に失敗しました。</p>
          <Link href="/" style={{ color: '#4a90e2', marginTop: '1rem', display: 'inline-block' }}>書籍一覧へ戻る</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container" style={{ maxWidth: '600px' }}>
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '2.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>ご注文ありがとうございます！</h1>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>注文を受け付けました。</p>

          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>注文番号：</strong>
              <span style={{ fontSize: '1.2rem', color: '#2c3e50', fontWeight: 700 }}>#{order.id}</span>
            </p>
            <p style={{ marginBottom: '0.5rem' }}><strong>お名前：</strong>{order.customer_name}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>メールアドレス：</strong>{order.customer_email}</p>
            <p><strong>お届け先：</strong>{order.customer_address}</p>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>ご注文内容</h2>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{item.title} × {item.quantity}</span>
                <span>¥{(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e9ecef', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>合計</span>
              <span style={{ color: '#e74c3c' }}>¥{order.total_amount.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-block', background: '#2c3e50', color: '#fff',
              borderRadius: '6px', padding: '0.75rem 2rem', fontWeight: 600,
            }}
          >
            書籍一覧へ戻る
          </Link>
        </div>
      </main>
    </>
  );
}
