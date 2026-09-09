"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorNotice from "@/components/ErrorNotice";
import OrderForm from "@/components/OrderForm";
import OrderSummary from "@/components/OrderSummary";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api/orders";
import type { CustomerInfo } from "@/types/order";
import styles from "./page.module.css";

export default function OrderPage() {
  const router = useRouter();
  const { items, isLoaded, clearCart } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasCompletedOrderRef = useRef(false);

  useEffect(() => {
    if (isLoaded && items.length === 0 && !hasCompletedOrderRef.current) {
      router.replace("/cart");
    }
  }, [isLoaded, items, router]);

  if (!isLoaded || items.length === 0) {
    return null;
  }

  async function handleValidSubmit(customerInfo: CustomerInfo) {
    setSubmitError(null);
    try {
      const { orderNumber } = await createOrder(customerInfo, items);
      // 空カート差し戻しの useEffect が clearCart() 直後の再レンダリングでも
      // /cart への遷移を起こさないよう、先にフラグを立ててから状態を更新する
      hasCompletedOrderRef.current = true;
      clearCart();
      router.push(`/order/complete/${orderNumber}`);
    } catch {
      setSubmitError("注文の確定に失敗しました。しばらくしてから再度お試しください。");
    }
  }

  return (
    <main className={styles.main}>
      <OrderSummary items={items} />
      {submitError && <ErrorNotice message={submitError} />}
      <OrderForm onValidSubmit={handleValidSubmit} />
    </main>
  );
}
