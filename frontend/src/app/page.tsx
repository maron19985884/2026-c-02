import BookCard from '@/components/BookCard';
import { fetchBooks } from '@/lib/api';

export default async function HomePage() {
  let books: Awaited<ReturnType<typeof fetchBooks>> = [];
  let errorMessage: string | null = null;

  try {
    books = await fetchBooks();
  } catch {
    errorMessage =
      '書籍情報の取得に失敗しました。しばらくしてから再度お試しください。';
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500 text-center">{errorMessage}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">現在販売中の書籍はありません</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">書籍一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
