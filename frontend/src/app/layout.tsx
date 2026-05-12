import Header from '@/components/Header';

export const metadata = {
  title: '個人書店',
  description: 'オンライン書店の購買フロー',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin:          0,
          padding:         0,
          fontFamily:      "'Noto Sans JP', sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
          backgroundColor: '#f7fafc',
          minHeight:       '100vh',
        }}
      >
        <Header />
        <div
          style={{
            maxWidth: '960px',
            margin:   '0 auto',
            padding:  '1.5rem 1rem',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
