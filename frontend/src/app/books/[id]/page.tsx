"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import { ApiError, api } from "@/lib/api";
import { addItem } from "@/lib/cart";
import { formatYen } from "@/lib/format";
import type { BookDetail } from "@/lib/types";
import styles from "./page.module.css";

type Status = "loading" | "ok" | "not-found" | "error";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [book, setBook] = useState<BookDetail | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setStatus("not-found");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    api
      .getBook(id)
      .then((res) => {
        if (cancelled) return;
        setBook(res);
        setStatus("ok");
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus(e instanceof ApiError && e.code === "NOT_FOUND" ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") return <p>読み込み中…</p>;

  if (status === "not-found") {
    return (
      <EmptyState message="この書籍は見つかりませんでした。">
        <Link href="/" className="btn btn-secondary">
          商品一覧へ戻る
        </Link>
      </EmptyState>
    );
  }

  if (status === "error" || !book) {
    return (
      <ErrorNotice>
        <Link href="/" className={styles.backLink}>
          ← 商品一覧へ戻る
        </Link>
      </ErrorNotice>
    );
  }

  return (
    <article>
      <div className={styles.detail}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.cover} src={book.coverImageUrl} alt="" />
        <div>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>
          <p className={styles.price}>{formatYen(book.price)}</p>
          <p className={styles.description}>{book.description}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                addItem(book.id);
                setAdded(true);
              }}
            >
              カートに追加
            </button>
            <Link href="/" className="btn btn-secondary">
              一覧へ戻る
            </Link>
            {added && <span className={styles.added} role="status">カートに追加しました</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
