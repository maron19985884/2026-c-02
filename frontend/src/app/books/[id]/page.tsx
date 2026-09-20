/**
 * SCR-002 商品詳細。
 *
 * 詳細設計書 DETAIL-004 §1.2 に対応。
 * - 書影・タイトル・著者・価格・説明文を表示（FR-005）
 * - 404（不存在・販売停止）は「見つかりません」＋一覧へ戻る導線（FR-005a）
 * - 404 以外の取得失敗は ErrorNotice で表示し、404 と区別する（FR-030）
 * - 「カートに追加」は追加入力なしの1操作（FR-006）。成立はヘッダーの件数の増加で示す（FR-007）
 * - 追加後もそのまま一覧へ戻って閲覧を続けられる（FR-008）
 */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import { ApiClientError, fetchBook, type Book } from "@/lib/apiClient";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/lib/formatPrice";
import styles from "./page.module.css";

export default function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { addItem } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setError(null);
    setBook(null);
    try {
      setBook(await fetchBook(id));
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // 404 は「該当の書籍が見つかりません」として扱う。
  // 通信断やサーバエラーと区別しないと、サーバ停止時に利用者が
  // 「本が削除された」と誤解するため（FR-005a）。
  const isNotFound =
    error instanceof ApiClientError && error.code === "BOOK_NOT_FOUND";

  if (isNotFound) {
    return (
      <main className="container">
        <EmptyState
          message="該当の書籍が見つかりません"
          description="お探しの書籍は現在お取り扱いしていません。"
          actionHref="/"
          actionLabel="商品一覧へ戻る"
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <ErrorNotice error={error} onRetry={() => void load()} showBackToList />
      </main>
    );
  }

  if (book === null) {
    return (
      <main className="container">
        <p className={styles.loading}>読み込み中です…</p>
      </main>
    );
  }

  return (
    <main className="container">
      <article className={styles.detail}>
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

        <div>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>
          <p className={styles.price}>{formatPrice(book.price)}</p>
          <p className={styles.description}>{book.description}</p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.addButton}
              onClick={() => addItem(book.id)}
            >
              カートに追加
            </button>
            {/* 追加後もこのまま一覧へ戻って閲覧を続けられる（FR-008） */}
            <Link href="/" className={styles.backLink}>
              商品一覧へ戻る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
