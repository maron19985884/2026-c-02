import Link from "next/link";
import type { BookSummary } from "../lib/booksApi";

const PLACEHOLDER_COVER = "/images/placeholder-book.svg";

type Props = {
  book: BookSummary;
};

export default function BookCard({ book }: Props) {
  return (
    <Link href={`/books/${book.id}`} className="book-card">
      <img
        src={book.coverImageUrl ?? PLACEHOLDER_COVER}
        alt={book.title}
        className="book-card__cover"
      />
      <p className="book-card__title">{book.title}</p>
      <p className="book-card__author">{book.author}</p>
      <p className="book-card__price">¥{book.price.toLocaleString("ja-JP")}</p>
    </Link>
  );
}
