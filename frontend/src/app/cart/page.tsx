"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div style={{ minHeight: "100vh", background: "#0c0b09" }}>
      <header style={{
        borderBottom: "1px solid rgba(201,169,110,0.15)",
        padding: "1.25rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#0c0b09",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#ede8dc", letterSpacing: "0.15em" }}>LIBRAIRIE</span>
          <span style={{ marginLeft: "0.5rem", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.15em" }}>書</span>
        </Link>
        <Link href="/" style={{
          color: "#887d6f",
          textDecoration: "none",
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          fontFamily: "'Cormorant Garamond', serif",
          transition: "color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#887d6f")}
        >
          ← 書籍一覧
        </Link>
      </header>

      <main style={{ maxWidth: "880px", margin: "0 auto", padding: "4rem 2.5rem" }}>
        <div style={{ marginBottom: "3rem", animation: "fadeUp 0.6s ease both" }}>
          <p style={{ color: "#c9a96e", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif" }}>
            ショッピング
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 300, color: "#ede8dc", margin: 0, letterSpacing: "0.05em" }}>
            カート
          </h1>
          <div style={{ width: "36px", height: "1px", background: "#c9a96e", marginTop: "1.1rem" }} />
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", animation: "fadeIn 0.7s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ height: "1px", width: "36px", background: "rgba(201,169,110,0.25)" }} />
              <div style={{ width: "6px", height: "6px", border: "1px solid rgba(201,169,110,0.4)", transform: "rotate(45deg)" }} />
              <div style={{ height: "1px", width: "36px", background: "rgba(201,169,110,0.25)" }} />
            </div>
            <p style={{ color: "#887d6f", marginBottom: "1.75rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", letterSpacing: "0.05em" }}>
              カートに商品がありません
            </p>
            <Link href="/" style={{
              color: "#c9a96e",
              textDecoration: "none",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              書籍一覧へ
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem", animation: "fadeUp 0.6s ease 0.1s both" }}>
              {/* Column headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 110px 100px 36px",
                gap: "1rem",
                padding: "0 0 0.75rem",
                borderBottom: "1px solid rgba(201,169,110,0.2)",
                marginBottom: "0.25rem",
              }}>
                {["書名", "単価", "数量", "小計", ""].map((h, i) => (
                  <div key={i} style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: "#443e36",
                    fontFamily: "'Cormorant Garamond', serif",
                    textAlign: i >= 1 ? "center" : "left" as const,
                  }}>{h}</div>
                ))}
              </div>

              {items.map((item) => (
                <div key={item.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 110px 100px 36px",
                  gap: "1rem",
                  padding: "1.4rem 0",
                  borderBottom: "1px solid rgba(201,169,110,0.08)",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "0.88rem", color: "#ede8dc", marginBottom: "0.25rem", lineHeight: 1.5 }}>{item.title}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.78rem", color: "#887d6f", letterSpacing: "0.05em" }}>{item.author}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.92rem", color: "#c5bfb3", textAlign: "center" as const }}>
                    ¥{item.price.toLocaleString()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: "26px", height: "26px",
                        border: "1px solid rgba(201,169,110,0.25)",
                        background: "transparent", color: "#c9a96e",
                        cursor: "pointer", borderRadius: "2px",
                        fontSize: "0.95rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.2s",
                      }}
                    >−</button>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#ede8dc", fontSize: "1rem", minWidth: "1.2rem", textAlign: "center" as const }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: "26px", height: "26px",
                        border: "1px solid rgba(201,169,110,0.25)",
                        background: "transparent", color: "#c9a96e",
                        cursor: "pointer", borderRadius: "2px",
                        fontSize: "0.95rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.2s",
                      }}
                    >＋</button>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#c9a96e", textAlign: "center" as const, fontWeight: 500 }}>
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      border: "none", background: "transparent",
                      color: "#3a342b", cursor: "pointer",
                      fontSize: "0.9rem", padding: "0.25rem",
                      transition: "color 0.2s", lineHeight: 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a342b")}
                    aria-label="削除"
                  >✕</button>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "2rem",
              animation: "fadeUp 0.6s ease 0.2s both",
            }}>
              <div>
                <p style={{ margin: "0 0 0.3rem", color: "#887d6f", fontSize: "0.68rem", letterSpacing: "0.25em", textTransform: "uppercase" as const, fontFamily: "'Cormorant Garamond', serif" }}>
                  合計金額
                </p>
                <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 300, color: "#c9a96e", letterSpacing: "0.04em" }}>
                  ¥{total.toLocaleString()}
                </p>
              </div>
              <Link href="/order" style={{
                background: "#c9a96e",
                color: "#0c0b09",
                textDecoration: "none",
                padding: "0.9rem 2.75rem",
                borderRadius: "2px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                fontFamily: "'Cormorant Garamond', serif",
              }}>
                注文手続きへ
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
