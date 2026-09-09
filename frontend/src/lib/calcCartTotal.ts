import type { CartItem } from "@/types/cart";

export function calcCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
