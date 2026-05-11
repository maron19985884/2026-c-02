"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const AMZ = {
  navy: "#131921",
  orange: "#FF9900",
  yellow: "#FFD814",
  link: "#007185",
  text: "#0F1111",
  textSub: "#565959",
  green: "#007600",
  prime: "#00A8E1",
  borderLight: "#E7E7E7",
  bg: "#EAEDED",
  card: "#FFFFFF",
};

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const isValid = orderNumber !== null && orderNumber.startsWith("ORD-");

  if (!isValid) {
    return (
      <main style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 16, color: AMZ.textSub, marginBottom: 16 }}>注文情報が見つかりません。</p>
          <Link href="/" style={{ color: AMZ.link, fontSize: 14 }}>商品一覧に戻る</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      {/* Confirmation box */}
      <div style={{ background: AMZ.card, border: `1px solid ${AMZ.borderLight}`, borderRadius: 4, padding: 24 }}>
        {/* Green header bar */}
        <div style={{ background: "#F0FAF0", border: `1px solid #4CAF50`, borderRadius: 4,
          padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28, color: AMZ.green }}>✓</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: AMZ.green }}>ご注文ありがとうございます</div>
            <div style={{ fontSize: 14, color: AMZ.textSub, marginTop: 2 }}>
              ご注文が正常に受け付けられました。確認メールをお送りします。
            </div>
          </div>
        </div>

        {/* Order number */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: AMZ.textSub, marginBottom: 4 }}>注文番号</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: AMZ.link }}>{orderNumber}</div>
        </div>

        {/* Delivery info */}
        <div style={{ background: "#F3F3F3", borderRadius: 4, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>お届け予定</div>
          <div style={{ fontSize: 14, color: AMZ.text }}>
            <span style={{ color: AMZ.prime, fontWeight: 700 }}>Prime</span> 対応 — <strong>明日</strong>お届け予定
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
          <Link href="/" style={{ display: "inline-block", padding: "8px 24px",
            background: AMZ.yellow, border: "1px solid #C7A600",
            borderRadius: 20, fontSize: 14, cursor: "pointer",
            textDecoration: "none", color: AMZ.text, fontFamily: "Arial, sans-serif" }}>
            書籍一覧に戻る
          </Link>
          <Link href="/" style={{ display: "inline-block", padding: "8px 24px",
            background: "white", border: `1px solid ${AMZ.orange}`,
            borderRadius: 20, fontSize: 14, cursor: "pointer",
            textDecoration: "none", color: AMZ.text, fontFamily: "Arial, sans-serif" }}>
            注文履歴を確認する
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderCompletePage() {
  return (
    <div style={{ minHeight: "100vh", background: AMZ.bg, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ background: AMZ.navy, padding: "8px 16px", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "white" }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -1 }}>amazon</div>
          <div style={{ fontSize: 10, color: AMZ.orange, textAlign: "right", marginTop: -4 }}>.co.jp</div>
        </Link>
      </header>

      <Suspense fallback={<p style={{ padding: 24, color: AMZ.textSub }}>読み込み中…</p>}>
        <OrderCompleteContent />
      </Suspense>
    </div>
  );
}
