/**
 * SCR-005 注文完了。
 *
 * 詳細設計書 DETAIL-004 §2.11 に対応。
 * - マウント時に sessionStorage から読み出して即削除する（一度きり）
 * - 読み出せた場合のみ完了メッセージ・注文番号・一覧へ戻るリンクを表示
 *   （FR-027 / FR-028 / FR-029）
 * - 再読込・直接アクセス・ブックマークからの再訪では注文情報を表示せず
 *   商品一覧への導線のみを示す（FR-029a）
 * - 注文番号が再表示できない旨を画面上で伝える（FR-029c）
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CartSummary from "@/components/CartSummary";
import EmptyState from "@/components/EmptyState";
import type { OrderResult } from "@/lib/apiClient";
import { consumeLastOrder } from "@/lib/lastOrder";
import styles from "./page.module.css";

export default function OrderCompletePage() {
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // 読み出しと削除を1回で行う。再読込すると以降は null になる
    setOrder(consumeLastOrder());
    setIsChecked(true);
  }, []);

  if (!isChecked) {
    return (
      <main className="container">
        <p className={styles.loading}>読み込み中です…</p>
      </main>
    );
  }

  // 直前の確定以外では注文情報を一切表示しない（FR-029a）
  if (order === null) {
    return (
      <main className="container">
        <EmptyState
          message="表示できる注文情報がありません"
          description="注文完了の内容は、ご注文直後の一度のみ表示されます。"
          actionHref="/"
          actionLabel="商品一覧へ戻る"
        />
      </main>
    );
  }

  return (
    <main className="container">
      <div className={styles.complete}>
        <h1 className={styles.heading}>ご注文ありがとうございました</h1>
        <p className={styles.message}>
          ご注文を受け付けました。内容は以下のとおりです。
        </p>

        <div className={styles.orderNumberBox}>
          <p className={styles.orderNumberLabel}>注文番号</p>
          <p className={styles.orderNumber} data-testid="order-number">
            {order.orderNumber}
          </p>
        </div>

        <p className={styles.notice}>
          この注文番号は再表示できません。お問い合わせの際に必要となりますので、
          このページを離れる前にお控えください。
        </p>

        <div className={styles.summary}>
          <CartSummary
            lines={order.items.map((item, index) => ({
              bookId: index,
              title: item.title,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
            }))}
            total={order.totalAmount}
            caption="ご注文いただいた書籍"
          />
        </div>

        <Link href="/" className={styles.backLink}>
          商品一覧へ戻る
        </Link>
      </div>
    </main>
  );
}
