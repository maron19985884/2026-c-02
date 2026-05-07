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
      .then((data) => { setBook(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem({ id: book.id, title: book.title, author: book.author, price: book.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
        <Link href="/cart" style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#c5bfb3",
          fontSize: "0.8rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
          fontFamily: "'Cormorant Garamond', serif",
        }}>
          カート
          {cartCount > 0 && (
            <span style={{
              background: "#c9a96e",
              color: "#0c0b09",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              fontFamily: "'Noto Serif JP', serif",
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <main style={{ maxWidth: "1020px", margin: "0 auto", padding: "3.5rem 2.5rem" }}>
        <Link href="/" style={{
          color: "#887d6f",
          textDecoration: "none",
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          fontFamily: "'Cormorant Garamond', serif",
          display: "inline-block",
          marginBottom: "3rem",
          transition: "color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#887d6f")}
        >
          ← 書籍一覧に戻る
        </Link>

        {loading ? (
          <p style={{ color: "#887d6f", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", letterSpacing: "0.05em" }}>読み込み中…</p>
        ) : !book ? (
          <p style={{ color: "#ef4444", fontFamily: "'Noto Serif JP', serif", fontSize: "0.9rem" }}>書籍が見つかりません</p>
        ) : (
          <div style={{
            display: "flex",
            gap: "5rem",
            flexWrap: "wrap" as const,
            animation: "scaleIn 0.55s ease both",
          }}>
            {/* Book cover */}
            <div style={{ flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.image_url}
                alt={book.title}
                style={{
                  width: "240px",
                  height: "340px",
                  objectFit: "cover",
                  borderRadius: "2px",
                  display: "block",
                  boxShadow: "10px 10px 50px rgba(0,0,0,0.65), -1px -1px 0 rgba(201,169,110,0.15)",
                }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: "280px" }}>
              <p style={{
                margin: "0 0 1rem",
                color: "#c9a96e",
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase" as const,
                fontFamily: "'Cormorant Garamond', serif",
              }}>
                {book.author}
              </p>
              <h1 style={{
                margin: "0 0 1.5rem",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2.4rem",
                fontWeight: 300,
                color: "#ede8dc",
                lineHeight: 1.25,
                letterSpacing: "0.03em",
              }}>
                {book.title}
              </h1>
              <div style={{ width: "32px", height: "1px", background: "rgba(201,169,110,0.4)", marginBottom: "1.75rem" }} />

              <p style={{
                fontSize: "2.1rem",
                fontFamily: "'Cormorant Garamond', serif",
                color: "#c9a96e",
                margin: "0 0 2.25rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
              }}>
                ¥{book.price.toLocaleString()}
              </p>

              <p style={{
                margin: "0 0 2.75rem",
                color: "#c5bfb3",
                lineHeight: 2.1,
                fontSize: "0.88rem",
                fontFamily: "'Noto Serif JP', serif",
              }}>
                {book.description}
              </p>

              <button
                onClick={handleAddToCart}
                style={{
                  background: added ? "transparent" : "#c9a96e",
                  color: added ? "#c9a96e" : "#0c0b09",
                  border: "1px solid #c9a96e",
                  padding: "0.9rem 2.75rem",
                  borderRadius: "2px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  fontFamily: "'Cormorant Garamond', serif",
                  transition: "all 0.3s",
                  minWidth: "230px",
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
