"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="order-complete">
      <p className="order-complete__message">ご注文ありがとうございました</p>

      {orderNumber && (
        <p className="order-complete__order-number">注文番号: {orderNumber}</p>
      )}

      <div className="back-link">
        <Link href="/">商品一覧へ戻る</Link>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <main className="page">
      <h1 className="page__title">注文完了</h1>
      <Suspense fallback={<p className="state-message">読み込み中...</p>}>
        <OrderCompleteContent />
      </Suspense>
    </main>
  );
}
