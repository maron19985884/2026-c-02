"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

interface FormValues {
  customer_name: string;
  customer_email: string;
  customer_address: string;
}

interface FormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_address?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.customer_name.trim()) {
    errors.customer_name = "氏名は必須です";
  }
  if (!values.customer_email.trim()) {
    errors.customer_email = "メールアドレスは必須です";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) {
    errors.customer_email = "有効なメールアドレスを入力してください";
  }
  if (!values.customer_address.trim()) {
    errors.customer_address = "住所は必須です";
  }
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  const [values, setValues] = useState<FormValues>({
    customer_name: "",
    customer_email: "",
    customer_address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p>カートが空です。先に商品をカートに追加してください。</p>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          書籍一覧へ
        </button>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors = validate(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const result = await api.createOrder({
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_address: values.customer_address,
        items: items.map((i) => ({ book_id: i.book.id, quantity: i.quantity })),
      });
      clearCart();
      router.push(`/complete/${result.id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "注文に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 style={styles.heading}>注文フォーム</h1>

      <div style={styles.layout}>
        {/* フォーム */}
        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <h2 style={styles.sectionTitle}>お客様情報</h2>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              氏名 <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="customer_name"
              value={values.customer_name}
              onChange={handleChange}
              placeholder="山田 太郎"
              style={errors.customer_name ? { ...styles.input, ...styles.inputError } : styles.input}
            />
            {errors.customer_name && <p style={styles.errorMsg}>{errors.customer_name}</p>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              メールアドレス <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="customer_email"
              value={values.customer_email}
              onChange={handleChange}
              placeholder="example@email.com"
              style={errors.customer_email ? { ...styles.input, ...styles.inputError } : styles.input}
            />
            {errors.customer_email && <p style={styles.errorMsg}>{errors.customer_email}</p>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              住所 <span style={styles.required}>*</span>
            </label>
            <textarea
              name="customer_address"
              value={values.customer_address}
              onChange={handleChange}
              placeholder="東京都渋谷区〇〇 1-2-3"
              rows={3}
              style={errors.customer_address ? { ...styles.textarea, ...styles.inputError } : styles.textarea}
            />
            {errors.customer_address && <p style={styles.errorMsg}>{errors.customer_address}</p>}
          </div>

          {apiError && <p style={styles.apiError}>{apiError}</p>}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "処理中..." : "注文する"}
          </button>
        </form>

        {/* 注文内容確認 */}
        <div style={styles.orderSummary}>
          <h2 style={styles.sectionTitle}>注文内容</h2>
          {items.map(({ book, quantity }) => (
            <div key={book.id} style={styles.orderRow}>
              <span style={styles.orderTitle}>{book.title}</span>
              <span style={styles.orderQty}>×{quantity}</span>
              <span style={styles.orderSubtotal}>¥{(book.price * quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <span>合計</span>
            <span style={styles.totalAmount}>¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: "1.6rem", fontWeight: "bold", color: "#1a1a2e", marginBottom: "1.5rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" },
  form: { background: "#fff", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1.2rem", color: "#1a1a2e" },
  fieldGroup: { marginBottom: "1.2rem" },
  label: { display: "block", fontWeight: "bold", marginBottom: "0.4rem", fontSize: "0.9rem", color: "#333" },
  required: { color: "#e94560" },
  input: {
    width: "100%", padding: "10px 12px", border: "1px solid #ddd",
    borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%", padding: "10px 12px", border: "1px solid #ddd",
    borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box",
    resize: "vertical", outline: "none", fontFamily: "sans-serif",
  },
  inputError: { borderColor: "#e94560" },
  errorMsg: { color: "#e94560", fontSize: "0.82rem", margin: "0.3rem 0 0" },
  apiError: {
    background: "#fff0f0", border: "1px solid #e94560", color: "#e94560",
    padding: "0.8rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem",
  },
  submitBtn: {
    width: "100%", background: "#e94560", color: "#fff", border: "none",
    padding: "14px", borderRadius: "6px", cursor: "pointer",
    fontSize: "1rem", fontWeight: "bold", marginTop: "0.5rem",
  },
  orderSummary: {
    background: "#fff", borderRadius: "8px", padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: "80px",
  },
  orderRow: {
    display: "flex", gap: "0.5rem", alignItems: "baseline",
    marginBottom: "0.8rem", fontSize: "0.88rem",
  },
  orderTitle: { flex: 1, color: "#333", lineHeight: 1.4 },
  orderQty: { color: "#888", flexShrink: 0 },
  orderSubtotal: { fontWeight: "bold", color: "#1a1a2e", flexShrink: 0 },
  divider: { borderTop: "1px solid #eee", margin: "1rem 0" },
  totalRow: { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1rem" },
  totalAmount: { color: "#e94560", fontSize: "1.2rem" },
  empty: { textAlign: "center", padding: "4rem 0" },
  backBtn: {
    background: "#0f3460", color: "#fff", border: "none",
    padding: "10px 24px", borderRadius: "6px", cursor: "pointer",
    fontSize: "1rem", marginTop: "1rem",
  },
};
