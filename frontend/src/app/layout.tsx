import './globals.css';
import { CartProvider } from '../context/CartContext';
import Header from './components/Header';

export const metadata = { title: '書籍販売サンプルアプリ' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <Header />
          <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
