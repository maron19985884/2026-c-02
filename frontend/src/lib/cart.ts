// ブラウザ内カート（localStorage）。サーバには保持しない（CL-001 / FR-029）。
// 同一ブラウザではリロード後も直近のカートを復元する。

import { notifyCartChanged } from "./cartEvents";

export const CART_STORAGE_KEY = "bookstore.cart.v1";
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

export interface CartItem {
  bookId: number;
  quantity: number;
}

function isCartItem(v: unknown): v is CartItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.bookId === "number" &&
    Number.isInteger(o.bookId) &&
    o.bookId > 0 &&
    typeof o.quantity === "number" &&
    Number.isInteger(o.quantity) &&
    o.quantity >= MIN_QUANTITY
  );
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function clamp(q: number): number {
  if (!Number.isFinite(q)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(q)));
}

/** カートを読み出す。破損 JSON・不正データは空カートにフォールバックする。 */
export function readCart(): CartItem[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    const items = parsed.filter(isCartItem).map((i) => ({ bookId: i.bookId, quantity: clamp(i.quantity) }));
    // 同一 bookId が複数あれば合算（防御的）
    const merged = new Map<number, number>();
    for (const it of items) merged.set(it.bookId, clamp((merged.get(it.bookId) ?? 0) + it.quantity));
    return [...merged.entries()].map(([bookId, quantity]) => ({ bookId, quantity }));
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartChanged();
}

/** カートに1冊追加する。既にあればその明細の数量を +1（上限 99）。明細は増やさない（CL-002）。 */
export function addItem(bookId: number): CartItem[] {
  const items = readCart();
  const existing = items.find((i) => i.bookId === bookId);
  if (existing) {
    existing.quantity = clamp(existing.quantity + 1);
  } else {
    items.push({ bookId, quantity: 1 });
  }
  writeCart(items);
  return items;
}

/** 指定書籍の数量を設定する（1..99 にクランプ）。 */
export function setQuantity(bookId: number, quantity: number): CartItem[] {
  const items = readCart().map((i) =>
    i.bookId === bookId ? { ...i, quantity: clamp(quantity) } : i,
  );
  writeCart(items);
  return items;
}

/** 指定書籍をカートから取り除く。 */
export function removeItem(bookId: number): CartItem[] {
  const items = readCart().filter((i) => i.bookId !== bookId);
  writeCart(items);
  return items;
}

/** カートを空にする（注文確定後 / CL-004）。 */
export function clear(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
  notifyCartChanged();
}

/** カート内の合計冊数（ヘッダのバッジ用）。 */
export function totalCount(items: CartItem[] = readCart()): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
