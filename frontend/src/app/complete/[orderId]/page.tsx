"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order } from "@/types";

export default function OrderCompletePage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.orderId);
    if (isNaN(id)) {
      setError("注文情報が見つかりません");
      setLoading(false);
      return;
    }
    api
      .getOrder(id)
      .then(setOrder)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) return <p style={styles.center}>読み込み中...</p>;
  if (error || !order)
    return <p style={{ ...styles.center, color: "#e94560" }}>エラー: {error ?? "注文が見つかりません"}</p>;

  const dateStr = new Date(order.created_at).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* 完了アイコン */}
        <div style={styles.iconWrap}>
          <div style={styles.icon}>✓</div>
        </div>

        <h1 style={styles.heading}>ご注文ありがとうございます</h1>
        <p style={styles.sub}>注文を受け付けました。確認メールをお送りします。</p>

        {/* 注文番号 */}
        <div style={styles.orderNumberBox}>
          <p style={styles.orderNumberLabel}>注文番号</p>
          <p style={styles.orderNumber}>{order.order_number}</p>
          <p style={styles.orderDate}>{dateStr}</p>
        </div>

        {/* お客様情報 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>お届け先</h2>
          <table style={styles.table}>
            <tbody>
              <tr>
                <th style={styles.th}>お名前</th>
                <td style={styles.td}>{order.customer_name}</td>
              </tr>
              <tr>
                <th style={styles.th}>メール</th>
                <td style={styles.td}>{order.customer_email}</td>
              </tr>
              <tr>
                <th style={styles.th}>住所</th>
                <td style={styles.td}>{order.customer_address}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 注文明細 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>ご注文内容</h2>
          {order.items.map((item) => (
            <div key={item.id} style={styles.itemRow}>
              <span style={styles.itemTitle}>{item.title}</span>
              <span style={styles.itemDetail}>
                ¥{item.price.toLocaleString()} × {item.quantity} = ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <span>合計金額</span>
            <span style={styles.totalAmount}>¥{order.total_amount.toLocaleString()}</span>
          </div>
        </div>

        <Link href="/" style={styles.backLink}>
          書籍一覧へ戻る
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", justifyContent: "center" },
  card: {
    background: "#fff", borderRadius: "12px", padding: "2.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "640px", width: "100%",
  },
  iconWrap: { display: "flex", justifyContent: "center", marginBottom: "1rem" },
  icon: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "#2d6a4f", color: "#fff", fontSize: "2rem",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  heading: { textAlign: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#1a1a2e", margin: "0 0 0.5rem" },
  sub: { textAlign: "center", color: "#666", margin: "0 0 2rem" },
  orderNumberBox: {
    background: "#f0f4ff", borderRadius: "8px", padding: "1.2rem",
    textAlign: "center", marginBottom: "1.5rem",
  },
  orderNumberLabel: { color: "#666", fontSize: "0.85rem", margin: "0 0 0.3rem" },
  orderNumber: { fontSize: "1.4rem", fontWeight: "bold", color: "#0f3460", margin: "0 0 0.3rem", letterSpacing: "0.05em" },
  orderDate: { color: "#888", fontSize: "0.85rem", margin: 0 },
  section: { marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: "bold", color: "#1a1a2e", margin: "0 0 0.8rem", borderBottom: "2px solid #e94560", paddingBottom: "0.3rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "0.5rem 0.8rem", background: "#f5f5f5",
    color: "#555", fontSize: "0.85rem", fontWeight: "bold", width: "100px",
    borderBottom: "1px solid #eee",
  },
  td: { padding: "0.5rem 0.8rem", color: "#333", fontSize: "0.9rem", borderBottom: "1px solid #eee" },
  itemRow: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    padding: "0.6rem 0", borderBottom: "1px solid #f0f0f0", gap: "1rem",
  },
  itemTitle: { flex: 1, fontSize: "0.88rem", color: "#333", lineHeight: 1.4 },
  itemDetail: { fontSize: "0.88rem", color: "#555", flexShrink: 0 },
  divider: { borderTop: "2px solid #eee", margin: "1rem 0 0.5rem" },
  totalRow: { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.05rem" },
  totalAmount: { color: "#e94560", fontSize: "1.2rem" },
  backLink: {
    display: "block", textAlign: "center", marginTop: "2rem",
    background: "#1a1a2e", color: "#fff", padding: "12px 32px",
    borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "1rem",
  },
  center: { textAlign: "center", padding: "3rem", color: "#666" },
};
