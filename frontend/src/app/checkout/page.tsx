"use client";

import Link from "next/link";

import CheckoutForm from "@/components/CheckoutForm";
import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import { useCartLines } from "@/lib/useCartLines";

export default function CheckoutPage() {
  const { status, lines, total, isEmpty } = useCartLines();

  return (
    <div>
      <h1>注文フォーム</h1>

      {status === "loading" && <p>読み込み中…</p>}
      {status === "error" && <ErrorNotice />}

      {status === "ok" && isEmpty && (
        <EmptyState message="カートが空のため注文手続きに進めません。">
          <Link href="/" className="btn btn-secondary">
            商品一覧へ
          </Link>
        </EmptyState>
      )}

      {status === "ok" && !isEmpty && <CheckoutForm lines={lines} total={total} />}
    </div>
  );
}
