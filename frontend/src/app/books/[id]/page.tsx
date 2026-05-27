import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookCoverImage from '@/components/BookCoverImage';
import AddToCartButton from './AddToCartButton';
import { fetchBook, ApiError } from '@/lib/api';

export default async function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let book: Awaited<ReturnType<typeof fetchBook>>;

  try {
    book = await fetchBook(params.id);
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">
          書籍情報の取得に失敗しました。しばらくしてから再度お試しください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors"
      >
        ← 商品一覧へ戻る
      </Link>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="flex-shrink-0 w-full md:w-64 lg:w-80">
          <div className="relative aspect-[5/7] rounded-xl overflow-hidden shadow-md bg-gray-50">
            <BookCoverImage
              src={book.coverImageUrl}
              alt={book.title}
              width={320}
              height={448}
              fill
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
            {book.title}
          </h1>
          <p className="text-gray-600 mb-2">
            <span className="text-sm text-gray-400">著者：</span>
            {book.author}
          </p>
          <p className="text-2xl font-bold text-blue-600 mb-5">
            ¥{book.price.toLocaleString('ja-JP')}
            <span className="text-sm font-normal text-gray-500 ml-1">
              （税込）
            </span>
          </p>

          <hr className="border-gray-200 mb-5" />

          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-8">
            {book.description}
          </p>

          <AddToCartButton book={book} />
        </div>
      </div>
    </div>
  );
}
