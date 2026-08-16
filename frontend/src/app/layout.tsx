import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "オンライン書店",
  description: "個人運営オンライン書店",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
