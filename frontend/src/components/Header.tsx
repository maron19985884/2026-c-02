/**
 * 全画面共通ヘッダー。
 *
 * 詳細設計書 DETAIL-004 §2.12 に対応。
 * - カート画面への導線をどの画面からも提供する（FR-032 / FR-035）
 * - 件数は「数量の合計」であり行数ではない（FR-033）
 * - カート変更時に画面遷移を伴わず更新される（FR-034。Context の再描画による）
 * - 0件のときも件数が分かるよう 0 を表示する
 */
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import styles from "./Header.module.css";

export default function Header() {
  const { totalQuantity } = useCart();
  const isEmpty = totalQuantity === 0;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          オンライン書店
        </Link>

        <Link href="/cart" className={styles.cartLink}>
          <span>カート</span>
          <span
            className={`${styles.count} ${isEmpty ? styles.countEmpty : ""}`}
            data-testid="cart-count"
          >
            {totalQuantity}
          </span>
          <span className="visuallyHidden">点</span>
        </Link>
      </div>
    </header>
  );
}
