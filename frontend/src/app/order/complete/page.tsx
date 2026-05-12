'use client';

// SCR-05: 注文完了画面
// Client Component: useSearchParams() で URLクエリパラメータを読み取るため
// Next.js 14 の制約により useSearchParams() は <Suspense> でラップが必要

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// useSearchParams を使用する内部コンポーネント（Suspenseの子として使用する）
function OrderCompleteContent() {
  const searchParams = useSearchParams();
  // order_number クエリパラメータを取得する（存在しない場合は「不明」とする）
  const orderNumber = searchParams.get('order_number') ?? '不明';

  return (
    <main>
      <div
        style={{
          maxWidth:        '500px',
          margin:          '3rem auto',
          textAlign:       'center',
          backgroundColor: 'white',
          border:          '1px solid #e2e8f0',
          borderRadius:    '0.75rem',
          padding:         '2.5rem 2rem',
        }}
      >
        {/* 完了アイコン */}
        <div
          style={{
            width:           '64px',
            height:          '64px',
            borderRadius:    '50%',
            backgroundColor: '#c6f6d5',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            margin:          '0 auto 1.5rem',
            fontSize:        '2rem',
          }}
        >
          &#10003;
        </div>

        <h1
          style={{
            fontSize:     '1.5rem',
            fontWeight:   'bold',
            marginBottom: '0.75rem',
            color:        '#2d3748',
          }}
        >
          ご注文ありがとうございます
        </h1>

        <p
          style={{
            color:        '#718096',
            marginBottom: '1.5rem',
            lineHeight:   1.6,
          }}
        >
          ご注文を受け付けました。
        </p>

        {/* 注文番号 */}
        <div
          style={{
            backgroundColor: '#ebf8ff',
            border:          '1px solid #bee3f8',
            borderRadius:    '0.375rem',
            padding:         '1rem',
            marginBottom:    '2rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
            注文番号
          </p>
          <p
            style={{
              fontSize:   '1.25rem',
              fontWeight: 'bold',
              color:      '#2b6cb0',
              fontFamily: 'monospace',
            }}
          >
            {orderNumber}
          </p>
        </div>

        {/* 書籍一覧へ戻るリンク */}
        <Link
          href="/"
          style={{
            display:         'inline-block',
            backgroundColor: '#2b6cb0',
            color:           'white',
            textDecoration:  'none',
            padding:         '0.75rem 2rem',
            borderRadius:    '0.375rem',
            fontWeight:      'bold',
            fontSize:        '0.95rem',
          }}
        >
          書籍一覧へ戻る
        </Link>
      </div>
    </main>
  );
}

// Next.js 14 では useSearchParams() を使用するコンポーネントを
// Suspense でラップしないとビルド時警告が発生するため必ずラップする
export default function OrderCompletePage() {
  return (
    <Suspense fallback={<p style={{ color: '#718096', textAlign: 'center' }}>読み込み中...</p>}>
      <OrderCompleteContent />
    </Suspense>
  );
}
