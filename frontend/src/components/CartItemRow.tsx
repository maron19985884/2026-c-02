"use client";

import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/types/cart";
import styles from "./CartItemRow.module.css";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const subtotal = item.price * item.quantity;

  return (
    <div className={styles.row}>
      <span className={styles.title}>{item.title}</span>
      <span className={styles.price}>¥{item.price.toLocaleString()}</span>
      <div className={styles.quantity}>
        <button
          type="button"
          onClick={() => decreaseQuantity(item.bookId)}
          disabled={item.quantity <= 1}
          aria-label="数量を減らす"
        >
          −
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => increaseQuantity(item.bookId)} aria-label="数量を増やす">
          +
        </button>
      </div>
      <span className={styles.subtotal}>¥{subtotal.toLocaleString()}</span>
      <button type="button" className={styles.remove} onClick={() => removeItem(item.bookId)}>
        削除
      </button>
    </div>
  );
}
