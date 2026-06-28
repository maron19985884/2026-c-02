import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Book } from '../types';
import BookCard from '../components/BookCard';

interface Props {
  books: Book[];
  error?: string;
}

export default function BookListPage({ books, error }: Props) {
  return (
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>商品一覧</h1>
        <Link href="/cart" style={{ textDecoration: 'none', padding: '8px 16px', border: '1px solid #333', borderRadius: '4px' }}>
          カートを見る
        </Link>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {books.length === 0 && !error && <p>現在取り扱い書籍はありません。</p>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/books');
    if (!res.ok) return { props: { books: [], error: '書籍一覧の取得に失敗しました' } };
    const books: Book[] = await res.json();
    return { props: { books } };
  } catch {
    return { props: { books: [], error: 'バックエンドに接続できません。サーバーが起動しているか確認してください。' } };
  }
};
