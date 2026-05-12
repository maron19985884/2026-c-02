import { getBooks } from '@/api/client';
import BookCard from '@/components/BookCard';
import Header from '@/components/Header';

export const revalidate = 60;

export default async function BookListPage() {
  let books;
  try {
    books = await getBooks();
  } catch {
    return (
      <>
        <Header />
        <main className="container">
          <p style={{ color: '#e74c3c' }}>書籍の取得に失敗しました。バックエンドが起動しているか確認してください。</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>書籍一覧</h1>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}>
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </main>
    </>
  );
}
