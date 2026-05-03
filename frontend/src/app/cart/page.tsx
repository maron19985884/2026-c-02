"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header
        style={{
          background: "#1e3a8a",
          color: "white",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>📚 オンライン書店</h1>
        <Link
          href="/"
          style={{ color: "white", textDecoration: "none", fontSize: "0.95rem" }}
        >
          ← 書籍一覧に戻る
        </Link>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#111827" }}>カート</h2>

        {items.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              カートに商品がありません
            </p>
            <Link href="/" style={{ color: "#1e40af" }}>
              書籍一覧へ
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "left",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      書名
                    </th>
                    <th
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "right",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      単価
                    </th>
                    <th
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "center",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      数量
                    </th>
                    <th
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "right",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      小計
                    </th>
                    <th style={{ padding: "0.875rem 1rem" }} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ color: "#111827", fontSize: "0.95rem" }}>
                          {item.title}
                        </div>
                        <div
                          style={{ color: "#6b7280", fontSize: "0.82rem", marginTop: "0.2rem" }}
                        >
                          {item.author}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#374151",
                          fontSize: "0.95rem",
                        }}
                      >
                        ¥{item.price.toLocaleString()}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            style={{
                              width: "28px",
                              height: "28px",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              cursor: "pointer",
                              background: "white",
                              fontSize: "1rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: "1.5rem", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            style={{
                              width: "28px",
                              height: "28px",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              cursor: "pointer",
                              background: "white",
                              fontSize: "1rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ＋
                          </button>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#1e40af",
                        }}
                      >
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          aria-label="削除"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
                合計：
                <span style={{ color: "#1e40af" }}>
                  ¥{total.toLocaleString()}
                </span>
              </div>
              <Link
                href="/order"
                style={{
                  background: "#1e40af",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                注文手続きへ
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
