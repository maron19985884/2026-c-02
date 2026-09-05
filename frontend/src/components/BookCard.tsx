import Link from "next/link";

import { formatYen } from "@/lib/format";
import type { BookSummary } from "@/lib/types";
import styles from "./BookCard.module.css";

export default function BookCard({ book }: { book: BookSummary }) {
  return (
    <Link href={`/books/${book.id}`} className={styles.card}>
      {/* 書影は静的プレースホルダ。next/image は使わず素の img（外部最適化不要） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.cover} src={book.coverImageUrl} alt="" loading="lazy" />
      <div className={styles.body}>
        <span className={styles.title}>{book.title}</span>
        <span className={styles.author}>{book.author}</span>
        <span className={styles.price}>{formatYen(book.price)}</span>
      </div>
    </Link>
  );
}
