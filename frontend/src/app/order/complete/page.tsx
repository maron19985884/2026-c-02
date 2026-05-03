"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "0 auto",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
      <h2
        style={{
          color: "#111827",
          marginBottom: "0.75rem",
          fontSize: "1.5rem",
        }}
      >
        ご注文ありがとうございます！
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
        ご注文が正常に受け付けられました。
      </p>

      {orderNumber && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem",
              color: "#6b7280",
              fontSize: "0.85rem",
            }}
          >
            注文番号
          </p>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "#1e40af",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            {orderNumber}
          </p>
        </div>
      )}

      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "#1e40af",
          color: "white",
          textDecoration: "none",
          padding: "0.75rem 2.5rem",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        書籍一覧へ戻る
      </Link>
    </div>
  );
}

export default function OrderCompletePage() {
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
      <Suspense
        fallback={
          <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            読み込み中...
          </p>
        }
      >
        <OrderCompleteContent />
      </Suspense>
    </div>
  );
}
