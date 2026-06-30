import { useRouter } from "next/router";

export default function OrderCompletePage() {
  const router = useRouter();
  const { orderNumber } = router.query;

  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <h1 style={{ color: "#2e7d32" }}>✅ ご注文ありがとうございます！</h1>
      <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        ご注文を受け付けました。
      </p>
      {orderNumber && (
        <p style={{ fontSize: "1.3rem", fontWeight: "bold", margin: "1.5rem 0" }}>
          注文番号: <span style={{ color: "#e47911" }}>{orderNumber}</span>
        </p>
      )}
      <button
        onClick={() => router.push("/")}
        style={{
          padding: "0.75rem 2rem",
          background: "#1565c0",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        商品一覧に戻る
      </button>
    </div>
  );
}
