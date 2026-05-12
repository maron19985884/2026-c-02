'use client';

import type { CartItem } from '@/types';

type Props = {
  item:             CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove:         (productId: number) => void;
};

// カート1行の表示コンポーネント
// Client Component: ボタン操作のため
export default function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  const subtotal = item.price * item.quantity;

  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '1rem',
        padding:       '1rem',
        borderBottom:  '1px solid #e2e8f0',
      }}
    >
      {/* 書名 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight:   'bold',
            fontSize:     '0.95rem',
            marginBottom: '0.25rem',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {item.title}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#718096' }}>
          単価: &yen;{item.price.toLocaleString()}
        </p>
      </div>

      {/* 数量操作エリア */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* 数量「-」ボタン: quantity=1 のとき disabled */}
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          disabled={item.quantity === 1}
          aria-label="数量を減らす"
          style={{
            width:           '32px',
            height:          '32px',
            borderRadius:    '50%',
            border:          '1px solid #cbd5e0',
            backgroundColor: item.quantity === 1 ? '#edf2f7' : 'white',
            cursor:          item.quantity === 1 ? 'not-allowed' : 'pointer',
            fontSize:        '1rem',
          }}
        >
          -
        </button>

        <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
          {item.quantity}
        </span>

        {/* 数量「+」ボタン */}
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          aria-label="数量を増やす"
          style={{
            width:           '32px',
            height:          '32px',
            borderRadius:    '50%',
            border:          '1px solid #cbd5e0',
            backgroundColor: 'white',
            cursor:          'pointer',
            fontSize:        '1rem',
          }}
        >
          +
        </button>
      </div>

      {/* 小計 */}
      <div style={{ minWidth: '6rem', textAlign: 'right', fontWeight: 'bold' }}>
        &yen;{subtotal.toLocaleString()}
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onRemove(item.product_id)}
        aria-label={`${item.title}をカートから削除`}
        style={{
          color:           '#e53e3e',
          background:      'none',
          border:          'none',
          cursor:          'pointer',
          fontSize:        '1.25rem',
          padding:         '0.25rem',
        }}
      >
        &times;
      </button>
    </div>
  );
}
