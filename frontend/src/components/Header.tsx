"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readCart, totalCount } from "@/lib/cart";
import { CART_CHANGED_EVENT } from "@/lib/cartEvents";
import styles from "./Header.module.css";

export default function Header() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setCount(totalCount(readCart()));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CART_CHANGED_EVENT, sync);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          本屋オノ
        </Link>
        <nav className={styles.nav} aria-label="サイト内ナビゲーション">
          <Link href="/" className={styles.link}>
            商品一覧
          </Link>
          <Link href="/cart" className={styles.link}>
            カート
            {count !== null && count > 0 && (
              <span className={styles.badge} aria-label={`カートに${count}点`}>
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
