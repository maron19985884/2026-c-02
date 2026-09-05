"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import EmptyState from "@/components/EmptyState";
import styles from "./page.module.css";

function OrderCompleteView() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("number");

  if (!orderNumber) {
    return (
      <EmptyState message="表示できる注文情報がありません。">
        <Link href="/" className="btn btn-secondary">
          商品一覧へ戻る
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.message}>ご注文ありがとうございました。注文を受け付けました。</p>
      <p className={styles.numberLabel}>注文番号</p>
      <p className={styles.number}>{orderNumber}</p>
      <Link href="/" className="btn">
        商品一覧へ戻る
      </Link>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <OrderCompleteView />
    </Suspense>
  );
}
