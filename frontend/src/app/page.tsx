"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Book } from "@/types";

const AMZ = {
  navy: "#131921",
  header: "#232F3E",
  orange: "#FF9900",
  price: "#B12704",
  link: "#007185",
  text: "#0F1111",
  textSub: "#565959",
  green: "#007600",
  prime: "#00A8E1",
  border: "#D5D9D9",
  borderLight: "#E7E7E7",
  bg: "#EAEDED",
  card: "#FFFFFF",
};

const DUMMY_RATINGS: Record<number, { stars: number; count: number }> = {};
function getRating(id: number) {
  if (!DUMMY_RATINGS[id]) {
    const stars = 3.5 + (id % 5) * 0.3;
    const count = 100 + (id * 137) % 900;
    DUMMY_RATINGS[id] = { stars: Math.min(5, +stars.toFixed(1)), count };
  }
  return DUMMY_RATINGS[id];
}
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ color: AMZ.orange, fontSize: 13 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function ProductListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => { setBooks(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: AMZ.bg, fontFamily: "Arial, sans-serif" }}>
      {/* ===== HEADER ===== */}
      <header style={{ background: AMZ.navy, color: "white" }}>
        {/* Row 1 */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", gap: 8 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", color: "white", border: "1px solid transparent", padding: "4px 8px", borderRadius: 2 }}
            onMouseEnter={e => (e.currentTarget.style.border = "1px solid white")}
            onMouseLeave={e => (e.currentTarget.style.border = "1px solid transparent")}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -1 }}>amazon</div>
            <div style={{ fontSize: 10, color: AMZ.orange, textAlign: "right", marginTop: -4 }}>.co.jp</div>
          </Link>
          {/* Search */}
          <div style={{ flex: 1, display: "flex", maxWidth: 800 }}>
            <select style={{ background: "#F3F3F3", border: "none", padding: "0 8px", fontSize: 12, borderRadius: "4px 0 0 4px", height: 38, cursor: "pointer" }}>
              <option>すべて</option><option>本</option><option>技術書</option>
            </select>
            <input type="text" placeholder="キーワードを入力"
              style={{ flex: 1, border: "none", padding: "0 12px", fontSize: 14, height: 38, outline: "none" }} />
            <button style={{ background: AMZ.orange, border: "none", padding: "0 14px", borderRadius: "0 4px 4px 0", height: 38, cursor: "pointer", fontSize: 18 }}>
              🔍
            </button>
          </div>
          {/* Cart */}
          <Link href="/cart" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "flex-end", gap: 4, padding: 4,
            border: "1px solid transparent", borderRadius: 2 }}
            onMouseEnter={e => (e.currentTarget.style.border = "1px solid white")}
            onMouseLeave={e => (e.currentTarget.style.border = "1px solid transparent")}>
            <div style={{ position: "relative", fontSize: 28, lineHeight: 1 }}>
              🛒
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: AMZ.orange, color: AMZ.navy,
                  fontSize: 11, fontWeight: 700, borderRadius: "50%", padding: "1px 5px", minWidth: 16, textAlign: "center" }}>
                  {cartCount}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>カート</span>
          </Link>
        </div>
        {/* Row 2: Category nav */}
        <div style={{ background: AMZ.header, padding: "4px 16px", display: "flex", gap: 4, fontSize: 13 }}>
          {["☰ すべて", "本・コミック", "技術書", "ビジネス書", "新着", "ランキング"].map((label) => (
            <span key={label} style={{ padding: "6px 10px", cursor: "pointer", border: "1px solid transparent", borderRadius: 2, whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.border = "1px solid white")}
              onMouseLeave={e => (e.currentTarget.style.border = "1px solid transparent")}>
              {label}
            </span>
          ))}
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main style={{ maxWidth: 1500, margin: "0 auto", padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: AMZ.text }}>技術書一覧</h2>

        {loading ? (
          <p style={{ color: AMZ.textSub }}>読み込み中…</p>
        ) : error ? (
          <p style={{ color: "#CC0000" }}>書籍一覧の取得に失敗しました。時間をおいて再度お試しください。</p>
        ) : books.length === 0 ? (
          <p style={{ color: AMZ.textSub }}>販売中の書籍はありません。</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {books.map((book) => {
              const { stars, count } = getRating(book.id);
              return (
                <div key={book.id} style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 16, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.2)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                  <Link href={`/products/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {/* Image */}
                    <div style={{ textAlign: "center", marginBottom: 8, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={book.image_url} alt={book.title}
                        style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                    {/* Title */}
                    <div style={{ fontSize: 14, color: AMZ.link, marginBottom: 4, display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: 12, color: AMZ.textSub, marginBottom: 4 }}>{book.author}</div>
                    {/* Stars */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <Stars rating={stars} />
                      <span style={{ fontSize: 12, color: AMZ.link }}>{stars}</span>
                      <span style={{ fontSize: 12, color: AMZ.textSub }}>({count.toLocaleString()})</span>
                    </div>
                    {/* Price */}
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: AMZ.text }}>￥</span>
                      <span style={{ fontSize: 21, fontWeight: 700, color: AMZ.price }}>{book.price.toLocaleString()}</span>
                    </div>
                    {/* Prime */}
                    <div style={{ color: AMZ.prime, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>✓ Prime 対応</div>
                  </Link>
                  {/* Cart button */}
                  <button
                    onClick={() => addItem({ id: book.id, title: book.title, author: book.author, price: book.price })}
                    style={{ width: "100%", padding: "8px 0", background: AMZ.orange, border: "1px solid #C59000",
                      borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "Arial, sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FA8900")}
                    onMouseLeave={e => (e.currentTarget.style.background = AMZ.orange)}>
                    カートに追加
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
