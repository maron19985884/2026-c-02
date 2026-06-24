'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '../../../types';
import { useCart } from '../../../context/CartContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/books/${id}`)
      .then(r => r.json())
      .then(data => { setBook(data); setLoading(false); });
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (!book) return <p>書籍が見つかりません</p>;

  const handleAdd = () => {
    addItem(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <button onClick={() => router.back()} style={{ background: '#e5e7eb', color: '#333', marginBottom: '1.5rem' }}>
        ← 一覧に戻る
      </button>
      <div style={{ display: 'flex', gap: '2rem', background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexWrap: 'wrap' }}>
        <img src={book.image_url} alt={book.title} style={{ width: 240, height: 320, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{book.title}</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{book.author}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginBottom: '1.5rem' }}>
            ¥{book.price.toLocaleString()}
          </p>
          <p style={{ lineHeight: 1.7, color: '#444', marginBottom: '2rem' }}>{book.description}</p>
          <button
            onClick={handleAdd}
            style={{ background: added ? '#16a34a' : '#2563eb', color: '#fff', padding: '0.8rem 2rem', fontSize: '1rem' }}>
            {added ? '追加しました!' : 'カートに追加'}
          </button>
        </div>
      </div>
    </div>
  );
}
