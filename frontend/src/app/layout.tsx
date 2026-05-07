import Providers from "@/components/Providers";

export const metadata = { title: "オンライン書店 — 厳選された本の世界" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Noto+Serif+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.97); }
            to   { opacity: 1; transform: scale(1); }
          }

          input:focus, textarea:focus {
            outline: none;
            border-color: #c9a96e !important;
            box-shadow: 0 0 0 3px rgba(201,169,110,0.12) !important;
          }
          input::placeholder, textarea::placeholder { color: #443e36; }

          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: #0c0b09; }
          ::-webkit-scrollbar-thumb { background: #2a2520; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #3d3730; }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          background: "#0c0b09",
          color: "#ede8dc",
          minHeight: "100vh",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
