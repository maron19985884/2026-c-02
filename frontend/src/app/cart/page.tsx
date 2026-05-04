"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>カートに商品がありません</p>
        <Link href="/" style={styles.link}>
          書籍一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.heading}>カート</h1>

      <div style={styles.layout}>
        {/* 商品一覧 */}
        <div style={styles.itemList}>
          {items.map(({ book, quantity }) => (
            <div key={book.id} style={styles.row}>
              <div style={styles.bookInfo}>
                <div style={styles.cover}>
                  <MiniCover title={book.title} />
                </div>
                <div>
                  <p style={styles.bookTitle}>{book.title}</p>
                  <p style={styles.bookAuthor}>{book.author}</p>
                  <p style={styles.unitPrice}>単価: ¥{book.price.toLocaleString()}</p>
                </div>
              </div>

              <div style={styles.controls}>
                <div style={styles.qtyRow}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(book.id, quantity - 1)}
                  >
                    −
                  </button>
                  <span style={styles.qty}>{quantity}</span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(book.id, quantity + 1)}
                  >
                    ＋
                  </button>
                </div>
                <p style={styles.subtotal}>小計: ¥{(book.price * quantity).toLocaleString()}</p>
                <button
                  style={styles.removeBtn}
                  onClick={() => removeFromCart(book.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 合計・操作 */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>注文サマリー</h2>
          <div style={styles.summaryRow}>
            <span>商品点数</span>
            <span>{items.reduce((s, i) => s + i.quantity, 0)} 点</span>
          </div>
          <div style={styles.divider} />
          <div style={{ ...styles.summaryRow, ...styles.total }}>
            <span>合計金額</span>
            <span>¥{totalAmount.toLocaleString()}</span>
          </div>
          <button
            style={styles.checkoutBtn}
            onClick={() => router.push("/checkout")}
          >
            注文手続きへ進む
          </button>
          <Link href="/" style={styles.continueLink}>
            買い物を続ける
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniCover({ title }: { title: string }) {
  const colors = ["#16213e", "#0f3460", "#533483", "#2b4162", "#1b4332", "#3d405b", "#6b2737", "#2d6a4f"];
  const color = colors[title.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: "70px",
        height: "95px",
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        boxSizing: "border-box",
      }}
    >
      <span style={{ color: "#fff", fontSize: "0.55rem", textAlign: "center", lineHeight: 1.3 }}>
        {title.slice(0, 20)}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: "1.6rem", fontWeight: "bold", color: "#1a1a2e", marginBottom: "1.5rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" },
  itemList: { display: "flex", flexDirection: "column", gap: "1rem" },
  row: {
    background: "#fff", borderRadius: "8px", padding: "1rem 1.2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem",
  },
  bookInfo: { display: "flex", gap: "1rem", alignItems: "center", flex: 1 },
  cover: { flexShrink: 0 },
  bookTitle: { fontWeight: "bold", margin: "0 0 0.2rem", fontSize: "0.9rem", color: "#1a1a2e", lineHeight: 1.4 },
  bookAuthor: { color: "#666", fontSize: "0.8rem", margin: "0 0 0.2rem" },
  unitPrice: { color: "#888", fontSize: "0.8rem", margin: 0 },
  controls: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 },
  qtyRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  qtyBtn: {
    width: "28px", height: "28px", border: "1px solid #ddd", background: "#f5f5f5",
    borderRadius: "4px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
  },
  qty: { minWidth: "24px", textAlign: "center", fontWeight: "bold" },
  subtotal: { color: "#e94560", fontWeight: "bold", margin: 0, fontSize: "0.95rem" },
  removeBtn: {
    background: "none", border: "none", color: "#aaa", cursor: "pointer",
    fontSize: "0.8rem", textDecoration: "underline", padding: 0,
  },
  summary: {
    background: "#fff", borderRadius: "8px", padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "80px",
  },
  summaryTitle: { fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem", color: "#1a1a2e" },
  summaryRow: { display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.95rem" },
  divider: { borderTop: "1px solid #eee", margin: "1rem 0" },
  total: { fontWeight: "bold", fontSize: "1.1rem" },
  checkoutBtn: {
    width: "100%", background: "#e94560", color: "#fff", border: "none",
    padding: "12px", borderRadius: "6px", cursor: "pointer", fontSize: "1rem",
    fontWeight: "bold", marginTop: "1rem",
  },
  continueLink: {
    display: "block", textAlign: "center", marginTop: "0.8rem",
    color: "#0f3460", fontSize: "0.9rem",
  },
  empty: { textAlign: "center", padding: "4rem 0" },
  emptyText: { color: "#888", marginBottom: "1.5rem", fontSize: "1.1rem" },
  link: {
    color: "#fff", background: "#0f3460", padding: "10px 24px",
    borderRadius: "6px", textDecoration: "none", fontWeight: "bold",
  },
};
