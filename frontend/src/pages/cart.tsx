import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { itemSubtotal, MIN_QUANTITY } from '@/lib/cart';

/** カート画面（U-07〜U-11 / FR-007〜FR-011, FR-020, FR-022） */
export default function CartPage() {
  const { items, totalAmount, increase, decrease, remove } = useCart();

  return (
    <main>
      <h1>カート</h1>
      {items.length === 0 ? (
        <p>カートに商品がありません。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>書名</th>
              <th>単価</th>
              <th>数量</th>
              <th>小計</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.bookId}>
                <td>{item.title}</td>
                <td>{item.price}円</td>
                <td>
                  <button type="button" onClick={() => decrease(item.bookId)} disabled={item.quantity <= MIN_QUANTITY}>
                    -
                  </button>
                  <span> {item.quantity} </span>
                  <button type="button" onClick={() => increase(item.bookId)}>
                    +
                  </button>
                </td>
                <td>{itemSubtotal(item)}円</td>
                <td>
                  <button type="button" onClick={() => remove(item.bookId)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>合計金額: {totalAmount}円</p>
      {items.length > 0 && <Link href="/order">注文手続きに進む</Link>}
      <div>
        <Link href="/">商品一覧に戻る</Link>
      </div>
    </main>
  );
}
