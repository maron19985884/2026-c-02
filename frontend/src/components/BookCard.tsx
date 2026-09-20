/**
 * 商品一覧のカード。
 *
 * 詳細設計書 DETAIL-004 §2.12 に対応。
 * カード全体を詳細ページへのリンクにすることで、クリックでもキーボード操作でも
 * 詳細へ到達できるようにする（FR-002 / FR-003 / 憲法§3 アクセシビリティ）。
 */
import Link from "next/link";
import type { BookSummary } from "@/lib/apiClient";
import { formatPrice } from "@/lib/formatPrice";
import styles from "./BookCard.module.css";

interface BookCardProps {
  book: BookSummary;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className={styles.card}>
      {book.coverImageUrl ? (
        // 外部URLの書影を扱うため next/image ではなく img を使う
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverImageUrl}
          alt={`${book.title} の書影`}
          className={styles.cover}
        />
      ) : (
        <div className={styles.coverFallback} aria-hidden="true">
          書影なし
        </div>
      )}
      <p className={styles.title}>{book.title}</p>
      <p className={styles.author}>{book.author}</p>
      <p className={styles.price}>{formatPrice(book.price)}</p>
    </Link>
  );
}
