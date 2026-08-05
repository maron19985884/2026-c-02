import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchBookById, BookDetail } from '@/services/apiClient';
import { useCart } from '@/contexts/CartContext';

/** 商品詳細画面（U-04〜U-06 / FR-004〜FR-006, FR-021） */
export default function BookDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState<BookDetail | null | undefined>(undefined);
  const [added, setAdded] = useState(false);
  const { addBook } = useCart();

  useEffect(() => {
    if (typeof id !== 'string') return;
    fetchBookById(Number(id)).then((result) => setBook(result ?? null));
  }, [id]);

  if (book === undefined) {
    return <p>読み込み中...</p>;
  }
  if (book === null) {
    return (
      <main>
        <p>書籍が見つかりませんでした。</p>
        <Link href="/">商品一覧に戻る</Link>
      </main>
    );
  }

  return (
    <main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={book.imageUrl} alt={book.title} width={240} height={320} />
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.price}円</p>
      <p>{book.description}</p>
      <button
        type="button"
        onClick={() => {
          addBook(book);
          setAdded(true);
        }}
      >
        カートに追加
      </button>
      {added && <p role="status">カートに追加しました。</p>}
      <Link href="/">商品一覧に戻る</Link>
    </main>
  );
}
