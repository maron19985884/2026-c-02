import { CartItem } from "../types/api";

interface Props {
  items: CartItem[];
  totalAmount: number;
}

export default function OrderSummary({ items, totalAmount }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "1rem",
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginTop: 0 }}>注文内容</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "normal", color: "#555" }}>
              書籍
            </th>
            <th style={{ padding: "0.5rem", textAlign: "right", fontWeight: "normal", color: "#555" }}>
              数量
            </th>
            <th style={{ padding: "0.5rem", textAlign: "right", fontWeight: "normal", color: "#555" }}>
              小計
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.book.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>{item.book.title}</td>
              <td style={{ padding: "0.5rem", textAlign: "right" }}>{item.quantity}</td>
              <td style={{ padding: "0.5rem", textAlign: "right" }}>
                ¥{(item.book.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: "0.75rem",
          textAlign: "right",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        合計: ¥{totalAmount.toLocaleString()}
      </div>
    </div>
  );
}
