import type { Metadata } from 'next';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: '本のお店',
  description: 'オンライン書店',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
