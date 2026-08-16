"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBook, type Book } from "../../lib/booksApi";
import AddToCartButton from "../../components/AddToCartButton";

const PLACEHOLDER_COVER = "/images/placeholder-book.svg";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "success"; book: Book };

type Props = {
  params: { id: string };
};

export default function BookDetailPage({ params }: Props) {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const id = Number(params.id);

    getBook(id)
      .then((book) => {
        if (cancelled) return;
        if (book) {
          setState({ status: "success", book });
        } else {
          setState({ status: "not-found" });
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
  }, [params.id]);

  return (
    <main className="page">
      <p className="back-link">
        <Link href="/">← 一覧へ戻る</Link>
      </p>

      {state.status === "loading" && <p className="state-message">読み込み中...</p>}

      {state.status === "error" && (
        <p className="state-message state-message--error" role="alert">
          書籍情報の取得中に問題が発生しました。時間をおいて再度お試しください。
        </p>
      )}

      {state.status === "not-found" && <p className="state-message">書籍が見つかりません</p>}

      {state.status === "success" && (
        <article className="book-detail">
          <img
            src={state.book.coverImageUrl ?? PLACEHOLDER_COVER}
            alt={state.book.title}
            className="book-detail__cover"
          />
          <div className="book-detail__info">
            <h1 className="book-detail__title">{state.book.title}</h1>
            <p className="book-detail__author">{state.book.author}</p>
            <p className="book-detail__price">¥{state.book.price.toLocaleString("ja-JP")}</p>
            <p className="book-detail__description">{state.book.description}</p>
            <AddToCartButton bookId={state.book.id} />
          </div>
        </article>
      )}
    </main>
  );
}
