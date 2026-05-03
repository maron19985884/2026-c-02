"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Book } from "@/types";

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
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <Link
          href="/"
          style={{
            color: "#1e40af",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
          }}
        >
          ← 書籍一覧に戻る
        </Link>

        {loading ? (
          <p style={{ color: "#6b7280" }}>読み込み中...</p>
        ) : !book ? (
          <p style={{ color: "#ef4444" }}>書籍が見つかりません</p>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.image_url}
              alt={book.title}
              style={{
                width: "200px",
                height: "280px",
                objectFit: "cover",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h2 style={{ margin: "0 0 0.5rem", color: "#111827" }}>
                {book.title}
              </h2>
              <p style={{ margin: "0 0 0.75rem", color: "#6b7280" }}>
                {book.author}
              </p>
              <p
                style={{
                  margin: "0 0 1.5rem",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e40af",
                }}
              >
                ¥{book.price.toLocaleString()}
              </p>
              <p
                style={{
                  margin: "0 0 2rem",
                  color: "#374151",
                  lineHeight: 1.8,
                }}
              >
                {book.description}
              </p>
              <button
                onClick={handleAddToCart}
                style={{
                  background: added ? "#16a34a" : "#1e40af",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  minWidth: "200px",
                }}
              >
                {added ? "✓ カートに追加しました" : "カートに追加"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
