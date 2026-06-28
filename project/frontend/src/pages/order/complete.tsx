import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderCompletePage() {
  const router = useRouter();
  const { orderNumber } = router.query;

  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>ご注文ありがとうございます</h1>
      <p style={{ fontSize: '1.1em', marginTop: '16px' }}>
        ご注文を受け付けました。
      </p>
      {orderNumber && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '0.875em', color: '#666' }}>注文番号</p>
          <p style={{ margin: '8px 0 0', fontSize: '1.5em', fontWeight: 'bold' }}>
            {orderNumber}
          </p>
        </div>
      )}
      <div style={{ marginTop: '32px' }}>
        <Link href="/" style={{ padding: '10px 32px', border: '1px solid #333', borderRadius: '4px', textDecoration: 'none', color: '#333' }}>
          商品一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
