import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';

type Props = {
  product: Product;
};

// 商品一覧カードコンポーネント
// Server Component: クリックは <Link> で処理するためクライアント操作不要
export default function BookCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        display:        'block',
        textDecoration: 'none',
        color:          'inherit',
        border:         '1px solid #e2e8f0',
        borderRadius:   '0.5rem',
        overflow:       'hidden',
        transition:     'box-shadow 0.2s',
        backgroundColor: 'white',
      }}
    >
      {/* 書影エリア */}
      <div
        style={{
          width:           '100%',
          height:          '200px',
          backgroundColor: '#f7fafc',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          overflow:        'hidden',
          position:        'relative',
        }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          // 書影未設定時はプレースホルダーテキストを表示する
          <div
            style={{
              color:     '#a0aec0',
              fontSize:  '0.875rem',
              textAlign: 'center',
              padding:   '1rem',
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* 書籍情報エリア */}
      <div style={{ padding: '1rem' }}>
        <h2
          style={{
            fontSize:     '1rem',
            fontWeight:   'bold',
            marginBottom: '0.25rem',
            overflow:     'hidden',
            display:      '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.title}
        </h2>
        <p
          style={{
            fontSize:     '0.875rem',
            color:        '#718096',
            marginBottom: '0.5rem',
          }}
        >
          {product.author}
        </p>
        <p
          style={{
            fontSize:   '1.125rem',
            fontWeight: 'bold',
            color:      '#2d3748',
          }}
        >
          &yen;{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
