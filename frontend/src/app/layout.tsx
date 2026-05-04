import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Book Store | 個人運営オンライン書店",
  description: "技術書・専門書を購入できるオンライン書店です",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <CartProvider>
          <Header />
          <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
