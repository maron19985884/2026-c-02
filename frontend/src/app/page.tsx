"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Book } from "@/types";

export default function ProductListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((r) => r.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          href="/cart"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1e40af",
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          カート{cartCount > 0 ? `（${cartCount}）` : ""}
        </Link>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#111827" }}>書籍一覧</h2>
        {loading ? (
          <p style={{ color: "#6b7280" }}>読み込み中...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/products/${book.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.08)";
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.image_url}
                    alt={book.title}
                    style={{ width: "100%", height: "280px", objectFit: "cover" }}
                  />
                  <div style={{ padding: "1rem" }}>
                    <h3
                      style={{
                        margin: "0 0 0.3rem",
                        fontSize: "0.9rem",
                        color: "#111827",
                        lineHeight: 1.4,
                      }}
                    >
                      {book.title}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "0.82rem",
                        color: "#6b7280",
                      }}
                    >
                      {book.author}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: "#1e40af",
                        fontSize: "0.95rem",
                      }}
                    >
                      ¥{book.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
