/**
 * SCR-003 カート。
 *
 * 詳細設計書 DETAIL-004 §1.2 に対応。
 * - 書名・単価・数量・小計と合計を CartSummary で表示（FR-010 / FR-013）
 * - 数量の増減・明示的な削除を同画面で行う（FR-011 / FR-011a / FR-012）
 * - 0件は EmptyState を表示し、注文手続きへ進ませない（FR-014）
 * - 書籍情報の取得失敗は ErrorNotice。カートの中身は失わせない（FR-030）
 * - 販売停止・削除された書籍を特定できる形で提示する（FR-016b）
 * - 1冊以上のときのみ「注文手続きへ」で /checkout へ遷移（FR-015）
 */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CartSummary from "@/components/CartSummary";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import { fetchBooks, type BookSummary } from "@/lib/apiClient";
import { calcCartTotal } from "@/lib/calcCartTotal";
import { useCart } from "@/lib/cartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, isRestored, setQuantity, removeItem } = useCart();
  const [books, setBooks] = useState<BookSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBooks(await fetchBooks());
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isRestored || (books === null && error === null)) {
    return (
      <main className="container">
        <h1 className={styles.heading}>カート</h1>
        <p className={styles.loading}>読み込み中です…</p>
      </main>
    );
  }

  // 取得に失敗してもカートの中身は保持したままエラーを提示する
  if (error) {
    return (
      <main className="container">
        <h1 className={styles.heading}>カート</h1>
        <ErrorNotice error={error} onRetry={() => void load()} showBackToList />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container">
        <h1 className={styles.heading}>カート</h1>
        <EmptyState
          message="カートに商品がありません"
          description="商品一覧から書籍を追加してください。"
          actionHref="/"
          actionLabel="商品一覧へ戻る"
        />
      </main>
    );
  }

  const { lines, total, unavailableBookIds } = calcCartTotal(items, books ?? []);
  // 購入できない書籍が残っている間は注文手続きへ進ませない（FR-016b）
  const canCheckout = lines.length > 0 && unavailableBookIds.length === 0;

  return (
    <main className="container">
      <h1 className={styles.heading}>カート</h1>

      {unavailableBookIds.length > 0 && (
        <div className={styles.unavailable} role="alert">
          <p className={styles.unavailableTitle}>
            ご注文いただけない書籍がカートに含まれています
          </p>
          <ul className={styles.unavailableList}>
            {unavailableBookIds.map((bookId) => (
              <li key={bookId}>
                書籍ID {bookId}（販売を終了した可能性があります）{" "}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeItem(bookId)}
                >
                  カートから削除
                </button>
              </li>
            ))}
          </ul>
          <p>これらを削除すると注文手続きへ進めます。</p>
        </div>
      )}

      {lines.length > 0 && (
        <CartSummary
          lines={lines}
          total={total}
          editable
          onChangeQuantity={setQuantity}
          onRemove={removeItem}
          caption="カートに入っている書籍"
        />
      )}

      <div className={styles.actions}>
        {canCheckout ? (
          <Link href="/checkout" className={styles.checkoutButton}>
            注文手続きへ
          </Link>
        ) : (
          <button type="button" className={styles.checkoutButton} disabled>
            注文手続きへ
          </button>
        )}
      </div>
    </main>
  );
}
