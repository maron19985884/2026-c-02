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
      .then((data) => { setBooks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <div>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "#ede8dc",
            letterSpacing: "0.15em",
          }}>LIBRAIRIE</span>
          <span style={{
            marginLeft: "0.5rem",
            color: "#c9a96e",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 300,
            letterSpacing: "0.15em",
          }}>書</span>
        </div>
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

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2.5rem" }}>
        <div style={{ marginBottom: "3.5rem", animation: "fadeUp 0.7s ease both" }}>
          <p style={{
            color: "#c9a96e",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            marginBottom: "0.75rem",
            fontFamily: "'Cormorant Garamond', serif",
          }}>厳選された書籍のコレクション</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "3.25rem",
            fontWeight: 300,
            color: "#ede8dc",
            margin: 0,
            letterSpacing: "0.05em",
            lineHeight: 1.1,
          }}>書籍一覧</h1>
          <div style={{ width: "40px", height: "1px", background: "#c9a96e", marginTop: "1.25rem" }} />
        </div>

        {loading ? (
          <p style={{ color: "#887d6f", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", letterSpacing: "0.05em" }}>
            読み込み中…
          </p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "2rem",
          }}>
            {books.map((book, i) => (
              <Link key={book.id} href={`/products/${book.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#161410",
                    border: "1px solid rgba(201,169,110,0.1)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.3s, transform 0.35s, box-shadow 0.35s",
                    animation: "fadeUp 0.6s ease both",
                    animationDelay: `${i * 0.07}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)";
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,169,110,0.1)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.image_url}
                    alt={book.title}
                    style={{ width: "100%", height: "300px", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "1.25rem 1.1rem 1.4rem" }}>
                    <h3 style={{
                      margin: "0 0 0.4rem",
                      fontSize: "0.88rem",
                      color: "#ede8dc",
                      lineHeight: 1.55,
                      fontFamily: "'Noto Serif JP', serif",
                      fontWeight: 400,
                    }}>
                      {book.title}
                    </h3>
                    <p style={{
                      margin: "0 0 0.85rem",
                      fontSize: "0.78rem",
                      color: "#887d6f",
                      fontFamily: "'Cormorant Garamond', serif",
                      letterSpacing: "0.06em",
                    }}>
                      {book.author}
                    </p>
                    <p style={{
                      margin: 0,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                      color: "#c9a96e",
                      fontSize: "1.08rem",
                      letterSpacing: "0.04em",
                    }}>
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
