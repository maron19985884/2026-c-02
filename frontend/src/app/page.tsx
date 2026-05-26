'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book } from '../types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/books`)
      .then(r => r.json())
      .then(data => { setBooks(data); setLoading(false); });
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>書籍一覧</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {books.map(book => (
          <Link key={book.id} href={`/books/${book.id}`}>
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <img src={book.image_url} alt={book.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: '0.9rem' }}>
                <p style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.95rem' }}>{book.title}</p>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 8 }}>{book.author}</p>
                <p style={{ color: '#2563eb', fontWeight: 700 }}>¥{book.price.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
