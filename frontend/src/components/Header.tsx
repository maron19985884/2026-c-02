'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

// 共通ヘッダーコンポーネント
// カート数量バッジを表示するためClient Componentとして実装する
export default function Header() {
  const { totalCount } = useCart();

  return (
    <header
      style={{
        backgroundColor: '#1e3a5f',
        color:           'white',
        padding:         '0 1.5rem',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        height:          '60px',
        position:        'sticky',
        top:             0,
        zIndex:          100,
        boxShadow:       '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {/* サイト名 */}
      <Link
        href="/"
        style={{
          color:          'white',
          textDecoration: 'none',
          fontSize:       '1.25rem',
          fontWeight:     'bold',
        }}
      >
        個人書店
      </Link>

      {/* カートアイコン（バッジ付き） */}
      <Link
        href="/cart"
        style={{
          color:          'white',
          textDecoration: 'none',
          display:        'flex',
          alignItems:     'center',
          gap:            '0.5rem',
          position:       'relative',
        }}
        aria-label={`カート（${totalCount}件）`}
      >
        <span style={{ fontSize: '1.5rem' }}>&#128722;</span>
        {/* カートに商品があればバッジを表示する */}
        {totalCount > 0 && (
          <span
            style={{
              position:        'absolute',
              top:             '-8px',
              right:           '-8px',
              backgroundColor: '#e53e3e',
              color:           'white',
              borderRadius:    '50%',
              width:           '20px',
              height:          '20px',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        '0.75rem',
              fontWeight:      'bold',
            }}
          >
            {totalCount}
          </span>
        )}
        <span style={{ fontSize: '0.875rem' }}>カート</span>
      </Link>
    </header>
  );
}
