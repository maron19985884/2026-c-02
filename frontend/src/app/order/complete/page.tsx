"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div style={{
      maxWidth: "520px",
      margin: "0 auto",
      padding: "7rem 2rem",
      textAlign: "center",
      animation: "fadeUp 0.8s ease both",
    }}>
      {/* Ornamental divider */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2.75rem" }}>
        <div style={{ height: "1px", width: "48px", background: "rgba(201,169,110,0.3)" }} />
        <div style={{ width: "7px", height: "7px", border: "1px solid rgba(201,169,110,0.6)", transform: "rotate(45deg)" }} />
        <div style={{ height: "1px", width: "48px", background: "rgba(201,169,110,0.3)" }} />
      </div>

      <p style={{
        color: "#c9a96e",
        fontSize: "0.68rem",
        letterSpacing: "0.35em",
        textTransform: "uppercase" as const,
        marginBottom: "1.25rem",
        fontFamily: "'Cormorant Garamond', serif",
      }}>
        Order Confirmed
      </p>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "2.6rem",
        fontWeight: 300,
        color: "#ede8dc",
        margin: "0 0 1.25rem",
        letterSpacing: "0.04em",
        lineHeight: 1.25,
      }}>
        ご注文ありがとうございます
      </h2>
      <p style={{
        color: "#887d6f",
        marginBottom: "3rem",
        lineHeight: 2.1,
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "0.86rem",
      }}>
        ご注文が正常に受け付けられました。
      </p>

      {orderNumber && (
        <div style={{
          background: "#161410",
          border: "1px solid rgba(201,169,110,0.2)",
          borderRadius: "2px",
          padding: "2.25rem",
          marginBottom: "3.25rem",
          animation: "fadeUp 0.8s ease 0.25s both",
        }}>
          <p style={{
            margin: "0 0 0.85rem",
            color: "#887d6f",
            fontSize: "0.68rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            注文番号
          </p>
          <p style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "#c9a96e",
            letterSpacing: "0.15em",
          }}>
            {orderNumber}
          </p>
        </div>
      )}

      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "transparent",
          color: "#c9a96e",
          textDecoration: "none",
          border: "1px solid rgba(201,169,110,0.45)",
          padding: "0.9rem 2.75rem",
          borderRadius: "2px",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          fontFamily: "'Cormorant Garamond', serif",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#c9a96e";
          e.currentTarget.style.color = "#0c0b09";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#c9a96e";
        }}
      >
        書籍一覧へ戻る
      </Link>
    </div>
  );
}

export default function OrderCompletePage() {
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
      <Suspense fallback={
        <p style={{ padding: "2rem", textAlign: "center", color: "#887d6f", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>
          読み込み中…
        </p>
      }>
        <OrderCompleteContent />
      </Suspense>
    </div>
  );
}
