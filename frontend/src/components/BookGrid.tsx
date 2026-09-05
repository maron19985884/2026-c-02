import type { BookSummary } from "@/lib/types";
import BookCard from "./BookCard";
import styles from "./BookGrid.module.css";

export default function BookGrid({ books }: { books: BookSummary[] }) {
  return (
    <div className={styles.grid}>
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
