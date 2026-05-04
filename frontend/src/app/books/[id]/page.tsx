"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Book } from "@/types";
import { useCart } from "@/context/CartContext";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) {
      setError("不正なIDです");
      setLoading(false);
      return;
    }
    api
      .getBook(id)
      .then(setBook)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToCart() {
    if (!book) return;
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return <p style={styles.center}>読み込み中...</p>;
  if (error || !book)
    return <p style={{ ...styles.center, color: "#e94560" }}>エラー: {error ?? "書籍が見つかりません"}</p>;

  return (
    <div>
      <button onClick={() => router.back()} style={styles.back}>
        ← 一覧に戻る
      </button>

      <div style={styles.container}>
        {/* 書影 */}
        <div style={styles.coverWrap}>
          <BookCover title={book.title} />
        </div>

        {/* 詳細情報 */}
        <div style={styles.info}>
          <h1 style={styles.title}>{book.title}</h1>
          <p style={styles.author}>著者: {book.author}</p>
          <p style={styles.price}>¥{book.price.toLocaleString()}<span style={styles.tax}>（税込）</span></p>

          <div style={styles.divider} />

          <p style={styles.descLabel}>書籍説明</p>
          <p style={styles.description}>{book.description ?? "説明はありません"}</p>

          <div style={styles.actions}>
            <button
              onClick={handleAddToCart}
              style={added ? styles.btnAdded : styles.btn}
              disabled={added}
            >
              {added ? "✓ カートに追加しました" : "カートに追加"}
            </button>
            <button onClick={() => router.push("/cart")} style={styles.btnCart}>
              カートを見る
            </button>
          </div>
        </div>
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
        height: "380px",
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        boxSizing: "border-box",
        borderRadius: "8px",
      }}
    >
      <span style={{ color: "#fff", fontSize: "1rem", textAlign: "center", lineHeight: 1.7, fontWeight: "bold" }}>
        {title}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  back: {
    background: "none",
    border: "none",
    color: "#0f3460",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "0 0 1rem",
    display: "block",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "2.5rem",
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  coverWrap: {
    flexShrink: 0,
  },
  info: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 0.5rem",
    lineHeight: 1.5,
  },
  author: {
    color: "#555",
    margin: "0 0 1rem",
  },
  price: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#e94560",
    margin: "0 0 1rem",
  },
  tax: {
    fontSize: "0.9rem",
    fontWeight: "normal",
    color: "#888",
  },
  divider: {
    borderTop: "1px solid #eee",
    margin: "1rem 0",
  },
  descLabel: {
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 0.5rem",
  },
  description: {
    color: "#555",
    lineHeight: 1.8,
    margin: "0 0 2rem",
    flex: 1,
  },
  actions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  btn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  btnAdded: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "6px",
    cursor: "default",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  btnCart: {
    background: "#fff",
    color: "#0f3460",
    border: "2px solid #0f3460",
    padding: "12px 28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  center: {
    textAlign: "center",
    padding: "3rem",
    color: "#666",
  },
};
