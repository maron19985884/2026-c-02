import type { CartItem } from "@/types/cart";
import { calcCartTotal } from "@/lib/calcCartTotal";
import styles from "./OrderSummary.module.css";

interface OrderSummaryProps {
  items: CartItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const total = calcCartTotal(items);

  return (
    <section className={styles.summary}>
      <h2 className={styles.heading}>注文内容</h2>
      <div className={styles.list}>
        {items.map((item) => {
          const subtotal = item.price * item.quantity;
          return (
            <div key={item.bookId} className={styles.row}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.quantity}>数量: {item.quantity}</span>
              <span className={styles.subtotal}>¥{subtotal.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.total}>合計: ¥{total.toLocaleString()}</div>
    </section>
  );
}
