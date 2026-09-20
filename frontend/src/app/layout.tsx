/**
 * 全画面共通のレイアウト。
 *
 * 詳細設計書 DETAIL-004 §1.2 に対応。
 * CartProvider と Header をここに置くことで、5画面すべてに
 * カート状態と共通ヘッダーが行き渡る（FR-032〜FR-035）。
 */
import Header from "@/components/Header";
import { CartProvider } from "@/lib/cartContext";
import "./globals.css";

export const metadata = {
  title: "オンライン書店",
  description: "書籍を選んで注文できるオンライン書店",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
