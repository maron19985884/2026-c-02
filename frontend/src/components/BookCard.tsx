import Link from "next/link";
import type { BookListItem } from "@/types/book";
import styles from "./BookCard.module.css";

const PLACEHOLDER_IMAGE = "/images/book-placeholder.png";

interface BookCardProps {
  book: BookListItem;
}

export default function BookCard({ book }: BookCardProps) {
  const imageSrc = book.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <Link href={`/books/${book.id}`} className={styles.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={book.title} className={styles.cover} />
      <div className={styles.body}>
        <p className={styles.title}>{book.title}</p>
        <p className={styles.author}>{book.author}</p>
        <p className={styles.price}>¥{book.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
