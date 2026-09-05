"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import BookGrid from "@/components/BookGrid";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import type { BooksListResponse } from "@/lib/types";
import styles from "./page.module.css";

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function BookListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));

  const [data, setData] = useState<BooksListResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .getBooks(page)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setStatus("ok");
        // サーバが丸めたページ番号と URL がずれていれば正す
        if (res.totalPages > 0 && res.page !== page) {
          router.replace(res.page === 1 ? "/" : `/?page=${res.page}`);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [page, router]);

  const changePage = useCallback(
    (next: number) => {
      router.push(next === 1 ? "/" : `/?page=${next}`);
    },
    [router],
  );

  return (
    <div>
      <h1>販売中の書籍</h1>

      {status === "loading" && <p className={styles.loading}>読み込み中…</p>}

      {status === "error" && <ErrorNotice />}

      {status === "ok" && data && data.totalItems === 0 && (
        <EmptyState message="現在、販売中の書籍はありません。" />
      )}

      {status === "ok" && data && data.totalItems > 0 && (
        <>
          <BookGrid books={data.items} />
          <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className={styles.loading}>読み込み中…</p>}>
      <BookListView />
    </Suspense>
  );
}
