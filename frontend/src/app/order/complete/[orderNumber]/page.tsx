import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchOrderByNumber } from "@/lib/api/orders";
import styles from "./page.module.css";

interface OrderCompletePageProps {
  params: { orderNumber: string };
}

export default async function OrderCompletePage({ params }: OrderCompletePageProps) {
  let order;
  try {
    order = await fetchOrderByNumber(params.orderNumber);
  } catch {
    redirect("/");
  }

  return (
    <main className={styles.main}>
      <p className={styles.message}>ご注文ありがとうございました。注文が受け付けられました。</p>
      <p className={styles.orderNumber}>
        注文番号: <strong>{order.orderNumber}</strong>
      </p>
      <Link href="/" className={styles.backLink}>
        商品一覧へ戻る
      </Link>
    </main>
  );
}
