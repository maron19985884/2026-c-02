import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBooks, BookSummary } from '@/services/apiClient';

/** 商品一覧画面（U-01〜U-03 / FR-001〜FR-003） */
export default function BookListPage() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(() => setError('商品一覧の取得に失敗しました。'));
  }, []);

  return (
    <main>
      <h1>商品一覧</h1>
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.imageUrl} alt={book.title} width={160} height={213} />
            <p>{book.title}</p>
            <p>{book.author}</p>
            <p>{book.price}円</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
