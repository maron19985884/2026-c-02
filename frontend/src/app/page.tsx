"use client";

import { useEffect, useState } from "react";
import BookGrid from "./components/BookGrid";
import { listBooks, type BookSummary } from "./lib/booksApi";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; books: BookSummary[] };

export default function HomePage() {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    listBooks()
      .then((books) => {
        if (!cancelled) {
          setState({ status: "success", books });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page">
      <h1 className="page__title">商品一覧</h1>
      {state.status === "loading" && <p className="state-message">読み込み中...</p>}
      {state.status === "error" && (
        <p className="state-message state-message--error" role="alert">
          書籍情報の取得中に問題が発生しました。時間をおいて再度お試しください。
        </p>
      )}
      {state.status === "success" && <BookGrid books={state.books} />}
    </main>
  );
}
