/**
 * SCR-001 商品一覧。
 *
 * 詳細設計書 DETAIL-004 §2.6 のシーケンス図に対応。
 * - 販売中の書籍をグリッド表示（FR-001, FR-002）
 * - 0件は EmptyState。エラーにしない（FR-004）
 * - 取得失敗は ErrorNotice。白画面にしない（FR-030 / Edge Cases）
 * - ページ送り・追加読み込みの導線は設けない（FR-001c）
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import BookCard from "@/components/BookCard";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import { fetchBooks, type BookSummary } from "@/lib/apiClient";
import styles from "./page.module.css";

export default function BookListPage() {
  const [books, setBooks] = useState<BookSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setError(null);
    setBooks(null);
    try {
      setBooks(await fetchBooks());
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="container">
      <h1 className={styles.heading}>書籍一覧</h1>

      {error ? (
        <ErrorNotice error={error} onRetry={() => void load()} />
      ) : books === null ? (
        <p className={styles.loading}>読み込み中です…</p>
      ) : books.length === 0 ? (
        <EmptyState
          message="現在お取り扱いできる書籍がありません"
          description="入荷までしばらくお待ちください。"
        />
      ) : (
        <ul className={styles.grid}>
          {books.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
