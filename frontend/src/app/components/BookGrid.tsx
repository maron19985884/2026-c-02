import BookCard from "./BookCard";
import type { BookSummary } from "../lib/booksApi";

type Props = {
  books: BookSummary[];
};

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return <p className="state-message">現在販売中の書籍はありません</p>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
