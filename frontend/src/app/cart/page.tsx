"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

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
  yellow: "#FFD814",
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, padding: 4, color: "white" }}>
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
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, margin: "0 0 16px", color: AMZ.text }}>ショッピングカート</h1>

        {items.length === 0 ? (
          <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 18, color: AMZ.text, marginBottom: 16 }}>カートに商品がありません</p>
            <Link href="/" style={{ color: AMZ.link, fontSize: 14 }}>書籍一覧へ戻る</Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            {/* Left: Cart items */}
            <div style={{ flex: 1, minWidth: 320, background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 16 }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 8,
                borderBottom: `1px solid ${AMZ.borderLight}`, marginBottom: 8, fontSize: 12, color: AMZ.textSub }}>
                <span>価格</span>
              </div>

              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 16, padding: "16px 0",
                  borderBottom: `1px solid ${AMZ.borderLight}`, alignItems: "flex-start" }}>
                  {/* Image placeholder */}
                  <div style={{ width: 80, flexShrink: 0, height: 100, background: "#F3F3F3",
                    border: `1px solid ${AMZ.borderLight}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                    📚
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <Link href={`/products/${item.id}`} style={{ fontSize: 14, color: AMZ.link, textDecoration: "none", display: "block", marginBottom: 4 }}>
                      {item.title}
                    </Link>
                    <div style={{ fontSize: 12, color: AMZ.textSub, marginBottom: 4 }}>{item.author}</div>
                    <div style={{ color: AMZ.green, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>在庫あり</div>
                    <div style={{ color: AMZ.prime, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>✓ Prime 対応</div>

                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        style={{ padding: "4px 8px", border: `1px solid ${AMZ.border}`, borderRadius: 4,
                          background: "#F3F3F3", fontSize: 13, cursor: "pointer" }}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span style={{ color: AMZ.border }}>|</span>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: "none", border: "none", color: AMZ.link, fontSize: 13, cursor: "pointer", padding: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        削除
                      </button>
                      <span style={{ color: AMZ.border }}>|</span>
                      <button style={{ background: "none", border: "none", color: AMZ.link, fontSize: 13, cursor: "pointer", padding: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                        後で購入する
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ flexShrink: 0, fontWeight: 700, fontSize: 14, color: AMZ.price, textAlign: "right" as const }}>
                    ￥{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Subtotal bottom */}
              <div style={{ textAlign: "right" as const, paddingTop: 16, fontSize: 18 }}>
                小計 ({cartCount}点):&nbsp;
                <span style={{ fontWeight: 700, color: AMZ.price }}>￥{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Right: Order summary */}
            <div style={{ width: 280, flexShrink: 0, background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 16 }}>
              <div style={{ color: AMZ.green, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                ✓ Prime 対応商品は全て無料配送
              </div>
              <div style={{ fontSize: 18, marginBottom: 16 }}>
                小計 ({cartCount}点):&nbsp;
                <span style={{ fontWeight: 700, color: AMZ.price }}>￥{total.toLocaleString()}</span>
              </div>
              <Link href="/order" style={{ display: "block", width: "100%", padding: 10,
                background: AMZ.yellow, border: "1px solid #C7A600",
                borderRadius: 20, fontSize: 14, cursor: "pointer", fontFamily: "Arial, sans-serif",
                textAlign: "center", textDecoration: "none", color: AMZ.text, boxSizing: "border-box" as const }}>
                レジに進む
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
