import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const { items, totalAmount } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <h1>カート</h1>
        <p>カートに商品がありません。</p>
        <a href="/">商品一覧へ戻る</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1>カート</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>書名</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>単価</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>数量</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>小計</th>
            <th style={{ padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItem key={item.bookId} item={item} />
          ))}
        </tbody>
      </table>
      <CartSummary totalAmount={totalAmount} />
      <div style={{ marginTop: '24px' }}>
        <a href="/" style={{ marginRight: '16px' }}>商品一覧へ戻る</a>
        <button
          onClick={() => router.push('/order')}
          style={{ padding: '8px 24px' }}
        >
          注文手続きへ
        </button>
      </div>
    </div>
  );
}
