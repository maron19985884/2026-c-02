// SCR-01: 商品一覧画面
// Server Component: SEOと初期表示速度のためサーバー側でデータを取得する

import { fetchProducts } from '@/lib/api';
import BookCard from '@/components/BookCard';
import ErrorMessage from '@/components/ErrorMessage';

export default async function ProductListPage() {
  let products;
  try {
    products = await fetchProducts();
  } catch {
    return <ErrorMessage message="商品の読み込みに失敗しました。しばらくしてから再度アクセスしてください。" />;
  }

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
        書籍一覧
      </h1>

      {products.length === 0 ? (
        <p style={{ color: '#718096' }}>現在、取り扱い商品はありません。</p>
      ) : (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap:                 '1.5rem',
          }}
        >
          {products.map(product => (
            <BookCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
