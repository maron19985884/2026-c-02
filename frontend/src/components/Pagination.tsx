"use client";

import styles from "./Pagination.module.css";

/**
 * ページング操作（FR-031）。先頭 / 前 / 現在 / 次 / 末尾。
 * onChange に丸め済みの妥当なページ番号を渡す。
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  const go = (p: number) => onChange(Math.min(totalPages, Math.max(1, p)));
  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  return (
    <nav className={styles.pager} aria-label="ページ送り">
      <button className={styles.btn} onClick={() => go(1)} disabled={atFirst} aria-label="先頭ページ">
        «
      </button>
      <button className={styles.btn} onClick={() => go(page - 1)} disabled={atFirst} aria-label="前のページ">
        ‹ 前へ
      </button>
      <span className={styles.status} aria-current="page">
        {page} / {totalPages}
      </span>
      <button className={styles.btn} onClick={() => go(page + 1)} disabled={atLast} aria-label="次のページ">
        次へ ›
      </button>
      <button className={styles.btn} onClick={() => go(totalPages)} disabled={atLast} aria-label="末尾ページ">
        »
      </button>
    </nav>
  );
}
