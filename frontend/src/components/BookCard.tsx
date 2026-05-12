'use client';

import Link from 'next/link';
import { Book } from '@/types';

interface Props { book: Book; }

export default function BookCard({ book }: Props) {
  return (
    <Link href={`/books/${book.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        background: '#fff', borderRadius: '10px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.14)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
      >
        <img
          src={book.image_url ?? 'https://placehold.co/200x280?text=No+Image'}
          alt={book.title}
          width={200}
          height={280}
          style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: '0.9rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem', lineHeight: 1.4 }}>
            {book.title}
          </p>
          <p style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{book.author}</p>
          <p style={{ color: '#e74c3c', fontWeight: 700 }}>¥{book.price.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
