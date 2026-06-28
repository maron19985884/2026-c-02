import Link from 'next/link';
import { Book } from '../types';

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  return (
    <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}>
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            width="100%"
            style={{ display: 'block', marginBottom: '8px', height: '160px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ height: '160px', background: '#f0f0f0', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#999' }}>書影なし</span>
          </div>
        )}
        <strong style={{ display: 'block', marginBottom: '4px' }}>{book.title}</strong>
        <p style={{ margin: '4px 0', fontSize: '0.875em', color: '#666' }}>{book.author}</p>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>¥{book.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
