import Providers from "@/components/Providers";

export const metadata = { title: "オンライン書店" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
