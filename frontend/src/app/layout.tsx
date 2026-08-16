import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "オンライン書店",
  description: "個人運営オンライン書店",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="site-header__logo">
            オンライン書店
          </Link>
          <Link href="/cart" className="site-header__cart-link">
            カート
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
