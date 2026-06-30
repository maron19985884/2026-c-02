import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import CartItemRow from "../components/CartItemRow";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1>🛒 カート</h1>
        <p>カートに商品が入っていません。</p>
        <button onClick={() => router.push("/")}>書籍一覧へ</button>
      </div>
    );
  }

  return (
    <div>
      <h1>🛒 カート</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>書籍</th>
            <th style={{ padding: "0.75rem", textAlign: "right" }}>単価</th>
            <th style={{ padding: "0.75rem", textAlign: "center" }}>数量</th>
            <th style={{ padding: "0.75rem", textAlign: "right" }}>小計</th>
            <th style={{ padding: "0.75rem" }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItemRow
              key={item.book.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "right",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        合計: ¥{totalAmount.toLocaleString()}
      </div>
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/")}>← 書籍一覧に戻る</button>
        <button
          onClick={() => router.push("/checkout")}
          style={{
            padding: "0.75rem 2rem",
            background: "#e47911",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          注文手続きへ →
        </button>
      </div>
    </div>
  );
}
