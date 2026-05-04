"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Book } from "@/types";

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBooks()
      .then(setBooks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.center}>読み込み中...</p>;
  if (error) return <p style={{ ...styles.center, color: "#e94560" }}>エラー: {error}</p>;

  return (
    <div>
      <h1 style={styles.heading}>書籍一覧</h1>
      <div style={styles.grid}>
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`} style={styles.cardLink}>
            <div style={styles.card}>
              <div style={styles.imageWrap}>
                <BookCover title={book.title} />
              </div>
              <div style={styles.cardBody}>
                <p style={styles.title}>{book.title}</p>
                <p style={styles.author}>{book.author}</p>
                <p style={styles.price}>¥{book.price.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BookCover({ title }: { title: string }) {
  const colors = [
    "#16213e", "#0f3460", "#533483", "#2b4162",
    "#1b4332", "#3d405b", "#6b2737", "#2d6a4f",
  ];
  const color = colors[title.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          color: "#fff",
          fontSize: "0.8rem",
          textAlign: "center",
          lineHeight: 1.5,
          fontWeight: "bold",
          opacity: 0.9,
        }}
      >
        {title.length > 30 ? title.slice(0, 30) + "…" : title}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#1a1a2e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  imageWrap: {
    width: "100%",
  },
  cardBody: {
    padding: "0.9rem",
  },
  title: {
    fontSize: "0.88rem",
    fontWeight: "bold",
    margin: "0 0 0.3rem",
    lineHeight: 1.5,
    color: "#1a1a2e",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  author: {
    fontSize: "0.8rem",
    color: "#666",
    margin: "0 0 0.5rem",
  },
  price: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#e94560",
    margin: 0,
  },
  center: {
    textAlign: "center",
    padding: "3rem",
    color: "#666",
  },
};
