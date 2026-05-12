'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBook } from '@/api/client';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import { Book } from '@/types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getBook(Number(id))
      .then(setBook)
      .catch(() => setError('書籍が見つかりませんでした。'));
  }, [id]);

  function handleAddToCart() {
    if (!book) return;
    addItem(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="container">
          <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>
          <Link href="/" style={{ color: '#4a90e2' }}>← 書籍一覧に戻る</Link>
        </main>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Header />
        <main className="container"><p>読み込み中...</p></main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <Link href="/" style={{ color: '#4a90e2', fontSize: '0.9rem' }}>← 書籍一覧に戻る</Link>
        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <img
            src={book.image_url ?? 'https://placehold.co/200x280?text=No+Image'}
            alt={book.title}
            style={{ width: '220px', height: '308px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{book.title}</h1>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>{book.author}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e74c3c', marginBottom: '1.5rem' }}>
              ¥{book.price.toLocaleString()}
            </p>
            {book.description && (
              <p style={{ lineHeight: 1.8, color: '#495057', marginBottom: '2rem' }}>{book.description}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAddToCart}
                style={{ background: '#2c3e50', color: '#fff', padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                {added ? '✓ カートに追加しました' : 'カートに追加'}
              </button>
              <button
                onClick={() => router.push('/cart')}
                style={{ background: '#e74c3c', color: '#fff', padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                カートを見る
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
