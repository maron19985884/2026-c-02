"use client";

import Link from "next/link";

import EmptyState from "@/components/EmptyState";
import ErrorNotice from "@/components/ErrorNotice";
import OrderSummary from "@/components/OrderSummary";
import { useCartLines } from "@/lib/useCartLines";
import styles from "./page.module.css";

export default function CartPage() {
  const { status, lines, total, isEmpty } = useCartLines();

  return (
    <div>
      <h1>カート</h1>

      {status === "loading" && <p>読み込み中…</p>}
      {status === "error" && <ErrorNotice />}

      {status === "ok" && isEmpty && (
        <EmptyState message="カートに商品がありません。">
          <Link href="/" className="btn btn-secondary">
            商品一覧へ
          </Link>
        </EmptyState>
      )}

      {status === "ok" && !isEmpty && (
        <>
          <OrderSummary lines={lines} total={total} />
          <div className={styles.actions}>
            <Link href="/" className="btn btn-secondary">
              買い物を続ける
            </Link>
            <Link href="/checkout" className="btn">
              注文手続きへ
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
