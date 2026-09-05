"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, api } from "./api";
import { readCart } from "./cart";
import { CART_CHANGED_EVENT } from "./cartEvents";
import { total as sumTotal } from "./cartTotal";

export interface CartLine {
  bookId: number;
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  /** 書籍が取得できない（削除/非公開）場合 true。合計から除外される。 */
  unavailable: boolean;
}

export interface CartLinesState {
  status: "loading" | "ok" | "error";
  lines: CartLine[];
  total: number;
  isEmpty: boolean;
  reload: () => void;
}

/**
 * localStorage のカート（bookId + quantity）を、書籍詳細 API で
 * 表示用の明細（書名・単価・小計）に解決する。
 */
export function useCartLines(): CartLinesState {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const onChange = () => reload();
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    const items = readCart();

    if (items.length === 0) {
      setLines([]);
      setStatus("ok");
      return;
    }

    setStatus("loading");
    Promise.all(
      items.map(async (it) => {
        try {
          const book = await api.getBook(it.bookId);
          return {
            bookId: it.bookId,
            title: book.title,
            unitPrice: book.price,
            quantity: it.quantity,
            subtotal: book.price * it.quantity,
            unavailable: false,
          } satisfies CartLine;
        } catch (e) {
          if (e instanceof ApiError && e.code === "NOT_FOUND") {
            return {
              bookId: it.bookId,
              title: "(現在取り扱いのない書籍)",
              unitPrice: 0,
              quantity: it.quantity,
              subtotal: 0,
              unavailable: true,
            } satisfies CartLine;
          }
          throw e;
        }
      }),
    )
      .then((resolved) => {
        if (cancelled) return;
        setLines(resolved);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const total = sumTotal(
    lines.filter((l) => !l.unavailable).map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity })),
  );

  return {
    status,
    lines,
    total,
    isEmpty: lines.length === 0,
    reload,
  };
}
