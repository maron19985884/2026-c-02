// SCR-02: 商品詳細画面
// Server Component: SEOと初期表示速度のためサーバー側でデータを取得する
// カートへの追加ボタンのみ AddToCartButton として Client Component に分離する

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProduct } from '@/lib/api';
import AddToCartButton from '@/components/AddToCartButton';
import ErrorMessage from '@/components/ErrorMessage';

type Props = {
  params: { id: string };
};

export default async function ProductDetailPage({ params }: Props) {
  // IDを数値に変換してバリデーションする
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  let product;
  try {
    product = await fetchProduct(id);
  } catch (e: unknown) {
    // 404エラーの場合は notFound() を呼び出す
    if (e instanceof Error && e.message === 'Product not found') {
      notFound();
    }
    return <ErrorMessage message="商品の読み込みに失敗しました。しばらくしてから再度アクセスしてください。" />;
  }

  return (
    <main>
      {/* パンくずリスト */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#718096' }}>
        <Link href="/" style={{ color: '#4299e1', textDecoration: 'none' }}>
          書籍一覧
        </Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span>{product.title}</span>
      </nav>

      <div
        style={{
          display:   'flex',
          gap:       '2rem',
          flexWrap:  'wrap',
        }}
      >
        {/* 書影エリア */}
        <div
          style={{
            width:           '240px',
            minWidth:        '180px',
            height:          '320px',
            backgroundColor: '#f7fafc',
            border:          '1px solid #e2e8f0',
            borderRadius:    '0.375rem',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
            position:        'relative',
            overflow:        'hidden',
          }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="240px"
            />
          ) : (
            <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>No Image</span>
          )}
        </div>

        {/* 書籍情報エリア */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1
            style={{
              fontSize:     '1.5rem',
              fontWeight:   'bold',
              marginBottom: '0.5rem',
              color:        '#2d3748',
            }}
          >
            {product.title}
          </h1>

          <p
            style={{
              fontSize:     '1rem',
              color:        '#718096',
              marginBottom: '1rem',
            }}
          >
            著者: {product.author}
          </p>

          <p
            style={{
              fontSize:     '1.5rem',
              fontWeight:   'bold',
              color:        '#2b6cb0',
              marginBottom: '1.5rem',
            }}
          >
            &yen;{product.price.toLocaleString()}
            <span style={{ fontSize: '0.875rem', color: '#718096', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              （税込み）
            </span>
          </p>

          {/* カートに追加ボタン（Client Component） */}
          <div style={{ marginBottom: '1.5rem' }}>
            <AddToCartButton product={product} />
          </div>

          <Link
            href="/cart"
            style={{
              display:        'inline-block',
              color:          '#4299e1',
              textDecoration: 'none',
              fontSize:       '0.875rem',
            }}
          >
            カートを見る
          </Link>
        </div>
      </div>

      {/* 商品説明 */}
      {product.description && (
        <div
          style={{
            marginTop:    '2rem',
            padding:      '1.5rem',
            backgroundColor: 'white',
            border:       '1px solid #e2e8f0',
            borderRadius: '0.5rem',
          }}
        >
          <h2
            style={{
              fontSize:     '1.125rem',
              fontWeight:   'bold',
              marginBottom: '0.75rem',
              color:        '#2d3748',
            }}
          >
            商品説明
          </h2>
          <p style={{ lineHeight: 1.7, color: '#4a5568' }}>{product.description}</p>
        </div>
      )}
    </main>
  );
}
