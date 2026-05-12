import type { CartItem } from '@/types';

type Props = {
  items:       CartItem[];
  totalAmount: number;
};

// 注文内容確認エリアコンポーネント
// Server Component: 表示のみで操作不要
export default function OrderSummary({ items, totalAmount }: Props) {
  return (
    <div
      style={{
        border:       '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        overflow:     'hidden',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#edf2f7',
          padding:         '0.75rem 1rem',
          fontWeight:      'bold',
          fontSize:        '1rem',
        }}
      >
        注文内容の確認
      </div>

      {/* 明細行 */}
      {items.map(item => (
        <div
          key={item.product_id}
          style={{
            display:      'flex',
            justifyContent: 'space-between',
            alignItems:   'center',
            padding:      '0.75rem 1rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <span style={{ fontWeight: 'bold' }}>{item.title}</span>
            <span style={{ color: '#718096', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
              &times; {item.quantity}
            </span>
          </div>
          <div style={{ fontWeight: 'bold' }}>
            &yen;{(item.price * item.quantity).toLocaleString()}
          </div>
        </div>
      ))}

      {/* 合計行 */}
      <div
        style={{
          display:         'flex',
          justifyContent:  'space-between',
          alignItems:      'center',
          padding:         '1rem',
          backgroundColor: '#f7fafc',
          fontWeight:      'bold',
          fontSize:        '1.125rem',
        }}
      >
        <span>合計（税込み）</span>
        <span>&yen;{totalAmount.toLocaleString()}</span>
      </div>
    </div>
  );
}
