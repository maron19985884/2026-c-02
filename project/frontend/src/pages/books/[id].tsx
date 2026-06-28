import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Book } from '../../types';
import { useCart } from '../../context/CartContext';

interface Props {
  book: Book | null;
}

export default function BookDetailPage({ book }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (!book) {
    return (
      <div style={{ padding: '16px' }}>
        <p>書籍が見つかりません。</p>
        <Link href="/">商品一覧へ戻る</Link>
      </div>
    );
  }

  function handleAddToCart(): void {
    addToCart(book!);
    router.push('/');
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>← 商品一覧へ</Link>
      <h1 style={{ marginTop: '16px' }}>{book.title}</h1>
      {book.image_url ? (
        <img
          src={book.image_url}
          alt={book.title}
          style={{ maxWidth: '200px', display: 'block', marginBottom: '16px' }}
        />
      ) : (
        <div style={{ width: '200px', height: '260px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#999' }}>書影なし</span>
        </div>
      )}
      <p><strong>著者:</strong> {book.author}</p>
      <p><strong>価格:</strong> ¥{book.price.toLocaleString()}</p>
      {book.description && <p style={{ marginTop: '16px', lineHeight: '1.6' }}>{book.description}</p>}
      <button
        onClick={handleAddToCart}
        style={{ marginTop: '24px', padding: '10px 32px', fontSize: '1em', cursor: 'pointer' }}
      >
        カートに追加
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  try {
    const res = await fetch(`http://localhost:4000/api/books/${id}`);
    if (!res.ok) return { props: { book: null } };
    const book: Book = await res.json();
    return { props: { book } };
  } catch {
    return { props: { book: null } };
  }
};
