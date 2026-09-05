// カート変更を同一タブ内のコンポーネント（ヘッダのバッジ等）へ通知するための軽量イベント。
// localStorage の "storage" イベントは他タブにしか飛ばないため、自タブ用に CustomEvent を使う。

export const CART_CHANGED_EVENT = "cart:changed";

export function notifyCartChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}
