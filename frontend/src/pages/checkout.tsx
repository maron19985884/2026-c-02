import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderApi";
import OrderSummary from "../components/OrderSummary";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  customerName?: string;
  address?: string;
  email?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // T029: empty cart guard
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items, router]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!customerName.trim()) e.customerName = "氏名は必須です";
    if (!address.trim()) e.address = "住所は必須です";
    if (!email.trim()) {
      e.email = "メールアドレスは必須です";
    } else if (!EMAIL_RE.test(email)) {
      e.email = "メールアドレスの形式が正しくありません";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { orderNumber } = await createOrder({
        customerName,
        address,
        email,
        items: items.map((i) => ({
          bookId: i.book.id,
          quantity: i.quantity,
          unitPrice: i.book.price,
        })),
        totalAmount,
      });
      clearCart();
      router.push(`/order-complete?orderNumber=${orderNumber}`);
    } catch (err) {
      alert(`注文の送信に失敗しました。もう一度お試しください。\n${err}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box",
  };
  const errorStyle: React.CSSProperties = { color: "#c00", fontSize: "0.85rem", marginTop: "0.25rem" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: "bold" };

  return (
    <div>
      <h1>📝 注文フォーム</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", flexWrap: "wrap" }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={labelStyle}>氏名 <span style={{ color: "#c00" }}>*</span></label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.customerName ? "#c00" : "#ccc" }}
            />
            {errors.customerName && <p style={errorStyle}>{errors.customerName}</p>}
          </div>
          <div>
            <label style={labelStyle}>住所 <span style={{ color: "#c00" }}>*</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.address ? "#c00" : "#ccc" }}
            />
            {errors.address && <p style={errorStyle}>{errors.address}</p>}
          </div>
          <div>
            <label style={labelStyle}>メールアドレス <span style={{ color: "#c00" }}>*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.email ? "#c00" : "#ccc" }}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "0.75rem 2rem",
              background: submitting ? "#ccc" : "#e47911",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "送信中..." : "注文する"}
          </button>
        </form>
        <div>
          <OrderSummary items={items} totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  );
}
