import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.siteTitle}>
        オンライン書店
      </Link>
      <Link href="/cart" className={styles.cartLink}>
        カート
      </Link>
    </header>
  );
}
