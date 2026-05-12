'use client';

// SCR-03: カート画面
// Client Component: localStorageのカートデータを使用するため

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/CartItemRow';

export default function CartPage() {
  const { items, initialized, totalAmount, updateQuantity, removeItem } = useCart();

  // ハイドレーション完了前はローディング表示（SSR/CSR不一致を防ぐ）
  if (!initialized) {
    return <p style={{ color: '#718096' }}>読み込み中...</p>;
  }

  const isEmpty = items.length === 0;

  return (
    <main>
      <h1
        style={{
          fontSize:     '1.75rem',
          fontWeight:   'bold',
          marginBottom: '1.5rem',
          color:        '#2d3748',
        }}
      >
        カート
      </h1>

      {isEmpty ? (
        <div
          style={{
            textAlign:       'center',
            padding:         '3rem',
            backgroundColor: 'white',
            border:          '1px solid #e2e8f0',
            borderRadius:    '0.5rem',
          }}
        >
          <p style={{ color: '#718096', marginBottom: '1.5rem', fontSize: '1rem' }}>
            カートに商品がありません。
          </p>
          <Link
            href="/"
            style={{
              color:          '#4299e1',
              textDecoration: 'none',
              fontWeight:     'bold',
            }}
          >
            書籍一覧へ戻る
          </Link>
        </div>
      ) : (
        <>
          {/* カートアイテム一覧 */}
          <div
            style={{
              backgroundColor: 'white',
              border:          '1px solid #e2e8f0',
              borderRadius:    '0.5rem',
              overflow:        'hidden',
              marginBottom:    '1.5rem',
            }}
          >
            {items.map(item => (
              <CartItemRow
                key={item.product_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* 合計金額 */}
          <div
            style={{
              display:         'flex',
              justifyContent:  'flex-end',
              alignItems:      'center',
              gap:             '1rem',
              backgroundColor: 'white',
              border:          '1px solid #e2e8f0',
              borderRadius:    '0.5rem',
              padding:         '1rem 1.5rem',
              marginBottom:    '1.5rem',
              fontSize:        '1.125rem',
              fontWeight:      'bold',
            }}
          >
            <span>合計（税込み）:</span>
            <span style={{ color: '#2b6cb0', fontSize: '1.5rem' }}>
              &yen;{totalAmount.toLocaleString()}
            </span>
          </div>

          {/* ナビゲーションボタン */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              flexWrap:       'wrap',
              gap:            '1rem',
            }}
          >
            <Link
              href="/"
              style={{
                color:          '#4299e1',
                textDecoration: 'none',
                fontSize:       '0.875rem',
              }}
            >
              &lt; 書籍一覧に戻る
            </Link>

            <Link
              href="/order"
              style={{
                backgroundColor: '#2b6cb0',
                color:           'white',
                textDecoration:  'none',
                padding:         '0.75rem 2rem',
                borderRadius:    '0.375rem',
                fontWeight:      'bold',
                fontSize:        '1rem',
              }}
            >
              注文手続きへ進む
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
