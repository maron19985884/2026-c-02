"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type FormErrors = { name?: string; address?: string; email?: string };

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
    if (!email.trim()) errs.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "メールアドレスの形式が正しくありません";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, address, email,
          items: items.map((i) => ({ book_id: i.id, title: i.title, price: i.price, quantity: i.quantity })),
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
      <div style={{ minHeight: "100vh", background: "#0c0b09", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#887d6f", marginBottom: "1.5rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", letterSpacing: "0.05em" }}>カートが空です</p>
          <Link href="/" style={{ color: "#c9a96e", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, fontFamily: "'Cormorant Garamond', serif" }}>
            書籍一覧へ
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.8rem 1rem",
    background: "#1a1710",
    border: "1px solid rgba(201,169,110,0.2)",
    borderRadius: "2px",
    fontSize: "0.9rem",
    color: "#ede8dc",
    boxSizing: "border-box",
    fontFamily: "'Noto Serif JP', serif",
    transition: "border-color 0.2s",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.5rem",
    color: "#887d6f",
    fontSize: "0.68rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    fontFamily: "'Cormorant Garamond', serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0b09" }}>
      <header style={{
        borderBottom: "1px solid rgba(201,169,110,0.15)",
        padding: "1.25rem 2.5rem",
        background: "#0c0b09",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#ede8dc", letterSpacing: "0.15em" }}>LIBRAIRIE</span>
          <span style={{ marginLeft: "0.5rem", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.15em" }}>書</span>
        </Link>
      </header>

      <main style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "4rem 2.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "3.5rem",
        alignItems: "start",
      }}>
        {/* Shipping form */}
        <div style={{ animation: "fadeUp 0.6s ease both" }}>
          <p style={{ color: "#c9a96e", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif" }}>
            お届け先
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 300, color: "#ede8dc", margin: "0 0 0.75rem", letterSpacing: "0.05em" }}>
            配送先情報
          </h2>
          <div style={{ width: "36px", height: "1px", background: "#c9a96e", marginBottom: "2.75rem" }} />

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={labelStyle}>氏名 <span style={{ color: "#c9a96e" }}>*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "rgba(201,169,110,0.2)" }}
                placeholder="山田 太郎"
              />
              {errors.name && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0.35rem 0 0", fontFamily: "'Noto Serif JP', serif" }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <label style={labelStyle}>住所 <span style={{ color: "#c9a96e" }}>*</span></label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ ...inputStyle, minHeight: "88px", resize: "vertical", borderColor: errors.address ? "#ef4444" : "rgba(201,169,110,0.2)" }}
                placeholder="東京都渋谷区..."
              />
              {errors.address && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0.35rem 0 0", fontFamily: "'Noto Serif JP', serif" }}>{errors.address}</p>}
            </div>

            <div style={{ marginBottom: "2.75rem" }}>
              <label style={labelStyle}>メールアドレス <span style={{ color: "#c9a96e" }}>*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "rgba(201,169,110,0.2)" }}
                placeholder="example@example.com"
              />
              {errors.email && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0.35rem 0 0", fontFamily: "'Noto Serif JP', serif" }}>{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? "rgba(201,169,110,0.45)" : "#c9a96e",
                color: "#0c0b09",
                border: "none",
                padding: "1.05rem",
                borderRadius: "2px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase" as const,
                fontFamily: "'Cormorant Garamond', serif",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background 0.25s",
              }}
            >
              {submitting ? "処理中…" : "注文を確定する"}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div style={{
          background: "#161410",
          border: "1px solid rgba(201,169,110,0.15)",
          borderRadius: "2px",
          padding: "1.75rem",
          animation: "fadeUp 0.6s ease 0.15s both",
          position: "sticky",
          top: "90px",
        }}>
          <h3 style={{
            margin: "0 0 1.5rem",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.75rem",
            fontWeight: 400,
            color: "#c9a96e",
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
          }}>
            注文内容
          </h3>
          {items.map((item) => (
            <div key={item.id} style={{
              paddingBottom: "1.1rem",
              marginBottom: "1.1rem",
              borderBottom: "1px solid rgba(201,169,110,0.08)",
            }}>
              <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "0.84rem", color: "#ede8dc", marginBottom: "0.35rem", lineHeight: 1.55 }}>
                {item.title}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem", color: "#887d6f" }}>
                ¥{item.price.toLocaleString()} × {item.quantity}冊 ={" "}
                <span style={{ color: "#c5bfb3" }}>¥{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "0.5rem" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.68rem", color: "#887d6f", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>合計</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.65rem", fontWeight: 300, color: "#c9a96e" }}>¥{total.toLocaleString()}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
