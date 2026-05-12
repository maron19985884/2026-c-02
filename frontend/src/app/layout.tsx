import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/hooks/useCart';

export const metadata: Metadata = { title: 'オンライン書店' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
