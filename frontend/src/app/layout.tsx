import type { Metadata } from "next";

import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "本屋オノ",
  description: "個人運営オンライン書店 購買フロー デモ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
