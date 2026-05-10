"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Book } from "@/types";

const AMZ = {
  navy: "#131921",
  header: "#232F3E",
  orange: "#FF9900",
  yellow: "#FFD814",
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setBook(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem({ id: book.id, title: book.title, author: book.author, price: book.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: AMZ.bg, fontFamily: "Arial, sans-serif" }}>
      {/* ===== HEADER ===== */}
      <header style={{ background: AMZ.navy, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", gap: 8 }}>
          <Link href="/" style={{ textDecoration: "none", color: "white", border: "1px solid transparent", padding: "4px 8px", borderRadius: 2 }}
            onMouseEnter={e => (e.currentTarget.style.border = "1px solid white")}
            onMouseLeave={e => (e.currentTarget.style.border = "1px solid transparent")}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -1 }}>amazon</div>
            <div style={{ fontSize: 10, color: AMZ.orange, textAlign: "right", marginTop: -4 }}>.co.jp</div>
          </Link>
          <div style={{ flex: 1, display: "flex", maxWidth: 800 }}>
            <select style={{ background: "#F3F3F3", border: "none", padding: "0 8px", fontSize: 12, borderRadius: "4px 0 0 4px", height: 38 }}>
              <option>すべて</option>
            </select>
            <input type="text" placeholder="キーワードを入力"
              style={{ flex: 1, border: "none", padding: "0 12px", fontSize: 14, height: 38, outline: "none" }} />
            <button style={{ background: AMZ.orange, border: "none", padding: "0 14px", borderRadius: "0 4px 4px 0", height: 38, cursor: "pointer", fontSize: 18 }}>
              🔍
            </button>
          </div>
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
        <div style={{ background: AMZ.header, padding: "4px 16px", fontSize: 13 }}>
          <Link href="/" style={{ color: "white", textDecoration: "none", padding: "6px 10px", display: "inline-block",
            border: "1px solid transparent", borderRadius: 2 }}
            onMouseEnter={e => (e.currentTarget.style.border = "1px solid white")}
            onMouseLeave={e => (e.currentTarget.style.border = "1px solid transparent")}>
            ← 書籍一覧に戻る
          </Link>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, marginBottom: 12, color: AMZ.textSub }}>
          <Link href="/" style={{ color: AMZ.link }}>本</Link>
          <span style={{ margin: "0 4px" }}>›</span>
          <Link href="/" style={{ color: AMZ.link }}>コンピュータ・テクノロジー</Link>
          <span style={{ margin: "0 4px" }}>›</span>
          <span>{book?.title ?? "…"}</span>
        </nav>

        {loading ? (
          <p style={{ color: AMZ.textSub }}>読み込み中…</p>
        ) : !book ? (
          <p style={{ color: "#CC0000" }}>書籍が見つかりません</p>
        ) : (
          <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 24 }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" as const, alignItems: "flex-start" }}>
              {/* Left: Image */}
              <div style={{ flexShrink: 0, width: 240 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.image_url} alt={book.title}
                  style={{ width: 240, height: "auto", maxHeight: 340, objectFit: "contain", display: "block", border: `1px solid ${AMZ.borderLight}` }} />
              </div>

              {/* Center: Product info */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <h1 style={{ fontSize: 24, fontWeight: 400, margin: "0 0 4px", color: AMZ.text, lineHeight: 1.3 }}>
                  {book.title}
                </h1>
                <div style={{ fontSize: 14, color: AMZ.link, marginBottom: 8 }}>
                  著者: <span style={{ color: AMZ.link }}>{book.author}</span>
                </div>

                <div style={{ borderBottom: `1px solid ${AMZ.borderLight}`, marginBottom: 12 }} />

                {/* Stars */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: AMZ.orange, fontSize: 18 }}>★★★★☆</span>
                  <span style={{ color: AMZ.link, fontSize: 14 }}>4.2</span>
                  <span style={{ color: AMZ.textSub, fontSize: 13 }}>· 1,234件の評価</span>
                </div>

                <div style={{ borderBottom: `1px solid ${AMZ.borderLight}`, marginBottom: 12 }} />

                {/* Price */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: AMZ.text }}>参考価格: </span>
                  <span style={{ fontSize: 13, color: AMZ.text }}>￥</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: AMZ.price }}>{book.price.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: AMZ.textSub, marginLeft: 8 }}>（税込）</span>
                </div>

                {/* Prime */}
                <div style={{ color: AMZ.prime, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                  ✓ Prime 対応 — 明日お届け
                </div>

                <div style={{ borderBottom: `1px solid ${AMZ.borderLight}`, marginBottom: 16 }} />

                {/* Description */}
                <div style={{ fontSize: 14, color: AMZ.text, lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>商品説明</div>
                  {book.description}
                </div>
              </div>

              {/* Right: Buy box */}
              <div style={{ width: 240, flexShrink: 0, border: `1px solid ${AMZ.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13 }}>￥</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: AMZ.price }}>{book.price.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: AMZ.prime, fontWeight: 700 }}>Prime</span> 対応 — <strong>明日</strong>お届け
                </div>
                <div style={{ color: AMZ.green, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>在庫あり</div>

                {/* Add to cart */}
                <button onClick={handleAddToCart}
                  style={{ width: "100%", padding: 10, background: added ? "#C3E6CB" : AMZ.orange,
                    border: `1px solid ${added ? "#28A745" : "#C59000"}`,
                    borderRadius: 20, fontSize: 14, cursor: "pointer", marginBottom: 8, fontFamily: "Arial, sans-serif",
                    color: added ? "#155724" : AMZ.text }}
                  onMouseEnter={e => { if (!added) e.currentTarget.style.background = "#FA8900"; }}
                  onMouseLeave={e => { if (!added) e.currentTarget.style.background = AMZ.orange; }}>
                  {added ? "✓ カートに追加しました" : "カートに追加"}
                </button>

                {/* Buy now */}
                <Link href="/cart" style={{ display: "block", width: "100%", padding: 10,
                  background: "#FFD814", border: "1px solid #C7A600",
                  borderRadius: 20, fontSize: 14, cursor: "pointer", fontFamily: "Arial, sans-serif",
                  textAlign: "center", textDecoration: "none", color: AMZ.text, boxSizing: "border-box" as const }}>
                  カートを見る
                </Link>

                <div style={{ fontSize: 12, color: AMZ.textSub, marginTop: 12 }}>
                  販売: <span style={{ color: AMZ.link }}>オンライン書店</span>
                </div>
              </div>
            </div>

            {/* Reviews section */}
            <div style={{ marginTop: 32, borderTop: `1px solid ${AMZ.borderLight}`, paddingTop: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>カスタマーレビュー</h2>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 32, fontWeight: 700 }}>4.2</div>
                <div>
                  <div style={{ color: AMZ.orange, fontSize: 20 }}>★★★★☆</div>
                  <div style={{ fontSize: 13, color: AMZ.textSub }}>5つ星のうち4.2 · 1,234件の評価</div>
                </div>
              </div>
              {[
                { user: "tech_reader", stars: "★★★★★", title: "非常に参考になりました", body: "実践的な内容が多く、読み終えた後すぐに業務で活用できました。初心者から中級者まで幅広くおすすめです。" },
                { user: "programming_fan", stars: "★★★★☆", title: "丁寧な解説が良い", body: "概念の説明が丁寧で、サンプルコードも分かりやすい。もう少し応用例が欲しかったです。" },
              ].map((r) => (
                <div key={r.user} style={{ borderTop: `1px solid ${AMZ.borderLight}`, paddingTop: 16, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#F3F3F3", display: "inline-flex",
                      alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: AMZ.link }}>{r.user}</span>
                  </div>
                  <div style={{ color: AMZ.orange, fontSize: 14, marginBottom: 2 }}>{r.stars}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: AMZ.text }}>{r.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
