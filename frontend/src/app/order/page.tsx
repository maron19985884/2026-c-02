"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type FormErrors = {
  name?: string;
  address?: string;
  email?: string;
};

export default function OrderPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "氏名を入力してください";
    if (!address.trim()) errs.address = "住所を入力してください";
    if (!email.trim()) {
      errs.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "メールアドレスの形式が正しくありません";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          email,
          items: items.map((i) => ({
            book_id: i.id,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      clearCart();
      router.push(`/order/complete?orderNumber=${data.order_number}`);
    } catch {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
            カートが空です
          </p>
          <Link href="/" style={{ color: "#1e40af" }}>
            書籍一覧へ
          </Link>
        </div>
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  };
  const errorText: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "0.82rem",
    marginTop: "0.3rem",
    marginBottom: 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <header
        style={{
          background: "#1e3a8a",
          color: "white",
          padding: "1rem 2rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>📚 オンライン書店</h1>
      </header>

      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "2rem",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* 配送先フォーム */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#111827" }}>
            配送先情報
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            {/* 氏名 */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.9rem",
                }}
              >
                氏名 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  ...inputBase,
                  borderColor: errors.name ? "#ef4444" : "#d1d5db",
                }}
                placeholder="山田 太郎"
              />
              {errors.name && <p style={errorText}>{errors.name}</p>}
            </div>

            {/* 住所 */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.9rem",
                }}
              >
                住所 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  ...inputBase,
                  minHeight: "80px",
                  resize: "vertical",
                  borderColor: errors.address ? "#ef4444" : "#d1d5db",
                }}
                placeholder="東京都渋谷区..."
              />
              {errors.address && <p style={errorText}>{errors.address}</p>}
            </div>

            {/* メールアドレス */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.9rem",
                }}
              >
                メールアドレス <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...inputBase,
                  borderColor: errors.email ? "#ef4444" : "#d1d5db",
                }}
                placeholder="example@example.com"
              />
              {errors.email && <p style={errorText}>{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? "#93c5fd" : "#1e40af",
                color: "white",
                border: "none",
                padding: "0.875rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "処理中..." : "注文する"}
            </button>
          </form>
        </div>

        {/* 注文内容サマリー */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: "#111827",
              fontSize: "1rem",
            }}
          >
            注文内容
          </h3>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ fontSize: "0.9rem", color: "#111827" }}>
                {item.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#6b7280",
                  marginTop: "0.25rem",
                }}
              >
                ¥{item.price.toLocaleString()} × {item.quantity}冊 ={" "}
                <strong>¥{(item.price * item.quantity).toLocaleString()}</strong>
              </div>
            </div>
          ))}
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#111827",
              textAlign: "right",
              marginTop: "0.5rem",
            }}
          >
            合計：
            <span style={{ color: "#1e40af" }}>¥{total.toLocaleString()}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
