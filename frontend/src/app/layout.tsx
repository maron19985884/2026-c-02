import Providers from "@/components/Providers";

export const metadata = { title: "オンライン書店" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; }
          a { color: #007185; }
          a:hover { color: #C7511F; text-decoration: underline; }
          input:focus, textarea:focus {
            outline: none;
            border-color: #E77600 !important;
            box-shadow: 0 0 0 3px rgba(231,118,0,0.25) !important;
          }
          input::placeholder, textarea::placeholder { color: #999; }
          button:focus { outline: 2px solid #E77600; outline-offset: 1px; }
        `}</style>
      </head>
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#EAEDED", color: "#0F1111", minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
