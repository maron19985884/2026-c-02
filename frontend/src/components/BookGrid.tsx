import type { BookListItem } from "@/types/book";
import BookCard from "./BookCard";
import EmptyState from "./EmptyState";
import styles from "./BookGrid.module.css";

interface BookGridProps {
  books: BookListItem[];
}

export default function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return <EmptyState message="販売中の書籍はまだありません。" />;
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
