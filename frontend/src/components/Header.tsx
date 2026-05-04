"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.logo}>
          📚 Book Store
        </Link>
        <nav style={styles.nav}>
          <Link href="/" style={styles.navLink}>
            商品一覧
          </Link>
          <Link href="/cart" style={styles.cartLink}>
            カート
            {totalCount > 0 && (
              <span style={styles.badge}>{totalCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: "0 1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
  },
  logo: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.25rem",
    fontWeight: "bold",
    letterSpacing: "0.02em",
  },
  nav: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  navLink: {
    color: "#ccc",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  cartLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.95rem",
    background: "#e94560",
    padding: "6px 16px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  badge: {
    background: "#fff",
    color: "#e94560",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
};
