"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type FormErrors = { name?: string; address?: string; email?: string; submit?: string };

const AMZ = {
  navy: "#131921",
  orange: "#FF9900",
  yellow: "#FFD814",
  price: "#B12704",
  link: "#007185",
  text: "#0F1111",
  textSub: "#565959",
  green: "#007600",
  prime: "#00A8E1",
  border: "#D5D9D9",
  borderLight: "#E7E7E7",
  bg: "#EAEDED",
  card: "#FFFFFF",
  red: "#CC0000",
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
    else if (name.trim().length > 100) errs.name = "氏名は100文字以内で入力してください";
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      clearCart();
      router.push(`/order/complete?orderNumber=${data.order_number}`);
    } catch {
      setErrors({ submit: "注文の送信に失敗しました。通信環境をご確認のうえ再度お試しください。" });
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px",
    border: `1px solid ${AMZ.border}`, borderRadius: 4,
    fontSize: 14, color: AMZ.text, boxSizing: "border-box",
    fontFamily: "Arial, sans-serif", background: "white",
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: AMZ.bg, fontFamily: "Arial, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: AMZ.textSub, marginBottom: 16, fontSize: 16 }}>カートが空です</p>
          <Link href="/" style={{ color: AMZ.link, fontSize: 14 }}>書籍一覧へ</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: AMZ.bg, fontFamily: "Arial, sans-serif" }}>
      {/* ===== HEADER (checkout style — simplified) ===== */}
      <header style={{ background: AMZ.navy, padding: "8px 16px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "none", color: "white" }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -1 }}>amazon</div>
          <div style={{ fontSize: 10, color: AMZ.orange, textAlign: "right", marginTop: -4 }}>.co.jp</div>
        </Link>
        <div style={{ flex: 1, textAlign: "center", color: "white", fontSize: 20, fontWeight: 400, letterSpacing: 1 }}>
          お支払い手続き
        </div>
        <div style={{ width: 80 }} />
      </header>

      {/* Progress bar */}
      <div style={{ background: "#F3F3F3", borderBottom: `1px solid ${AMZ.borderLight}`, padding: "8px 16px", display: "flex", gap: 16, fontSize: 13, maxWidth: 1200, margin: "0 auto" }}>
        {["1 お届け先情報", "2 支払い方法", "3 注文の確定"].map((step, i) => (
          <span key={step} style={{ color: i === 0 ? AMZ.orange : AMZ.textSub, fontWeight: i === 0 ? 700 : 400 }}>
            {step}
          </span>
        ))}
      </div>

      {/* ===== MAIN ===== */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, display: "grid",
        gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        {/* Shipping form */}
        <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", paddingBottom: 8, borderBottom: `1px solid ${AMZ.borderLight}` }}>
            お届け先情報を入力
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            {/* Submit error */}
            {errors.submit && (
              <p style={{ color: AMZ.red, fontSize: 14, marginBottom: 16, padding: "8px 12px",
                background: "#FFF5F5", border: `1px solid ${AMZ.red}`, borderRadius: 4 }}>
                {errors.submit}
              </p>
            )}
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                氏名 <span style={{ color: AMZ.red }}>*</span>
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.name ? AMZ.red : AMZ.border }}
                placeholder="山田 太郎" />
              {errors.name && <p style={{ color: AMZ.red, fontSize: 12, margin: "4px 0 0" }}>{errors.name}</p>}
            </div>

            {/* Address */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                住所 <span style={{ color: AMZ.red }}>*</span>
              </label>
              <textarea value={address} onChange={e => setAddress(e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical", borderColor: errors.address ? AMZ.red : AMZ.border }}
                placeholder="東京都渋谷区..." />
              {errors.address && <p style={{ color: AMZ.red, fontSize: 12, margin: "4px 0 0" }}>{errors.address}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                メールアドレス <span style={{ color: AMZ.red }}>*</span>
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.email ? AMZ.red : AMZ.border }}
                placeholder="example@example.com" />
              {errors.email && <p style={{ color: AMZ.red, fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
            </div>

            <button type="submit" disabled={submitting}
              style={{ width: "100%", padding: 10,
                background: submitting ? "#F5C518" : AMZ.yellow, border: "1px solid #C7A600",
                borderRadius: 20, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "Arial, sans-serif", color: AMZ.text }}>
              {submitting ? "処理中…" : "注文を確定する"}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 16, position: "sticky", top: 16 }}>
          <button style={{ width: "100%", padding: 10, background: AMZ.yellow, border: "1px solid #C7A600",
            borderRadius: 20, fontSize: 14, cursor: "pointer", fontFamily: "Arial, sans-serif",
            color: AMZ.text, marginBottom: 16 }}
            onClick={handleSubmit as unknown as React.MouseEventHandler}>
            注文を確定する
          </button>

          <div style={{ borderTop: `1px solid ${AMZ.borderLight}`, paddingTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>注文内容</h3>
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: AMZ.text, flex: 1, marginRight: 8 }}>
                  {item.title} × {item.quantity}
                </span>
                <span style={{ fontWeight: 700 }}>￥{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${AMZ.borderLight}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>商品の小計:</span>
              <span>￥{total.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 4 }}>
              <span>配送料:</span>
              <span style={{ color: AMZ.green }}>無料</span>
            </div>
            <div style={{ borderTop: `1px solid ${AMZ.borderLight}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 18 }}>
              <span style={{ fontWeight: 700 }}>ご注文合計:</span>
              <span style={{ fontWeight: 700, color: AMZ.price }}>￥{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
