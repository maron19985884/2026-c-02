import Link from 'next/link';
import BookCoverImage from '@/components/BookCoverImage';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block h-full">
      <article className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-200">
        <div className="relative aspect-[5/7] bg-gray-50 overflow-hidden">
          <BookCoverImage
            src={book.coverImageUrl}
            alt={book.title}
            width={200}
            height={280}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 min-h-[2.5rem]">
            {book.title}
          </h2>
          <p className="text-gray-500 text-xs truncate mb-3">{book.author}</p>
          <p className="text-blue-600 font-bold text-base">
            ¥{book.price.toLocaleString('ja-JP')}
          </p>
        </div>
      </article>
    </Link>
  );
}
