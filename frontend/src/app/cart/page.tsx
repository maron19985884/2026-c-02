"use client";

import Link from "next/link";
import CartItemRow from "@/components/CartItemRow";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/context/CartContext";
import { calcCartTotal } from "@/lib/calcCartTotal";
import styles from "./page.module.css";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <EmptyState message="カートに書籍がありません。" />
        <Link href="/" className={styles.backLink}>
          ← 一覧へ戻る
        </Link>
      </main>
    );
  }

  const total = calcCartTotal(items);

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>
        ← 一覧へ戻る
      </Link>
      <div className={styles.list}>
        {items.map((item) => (
          <CartItemRow key={item.bookId} item={item} />
        ))}
      </div>
      <div className={styles.total}>合計: ¥{total.toLocaleString()}</div>
      <Link href="/order" className={styles.checkoutButton}>
        注文手続きへ
      </Link>
    </main>
  );
}
