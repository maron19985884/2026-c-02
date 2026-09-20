/**
 * 注文完了画面への注文結果の受け渡し。
 *
 * 詳細設計書 DETAIL-004 §2.11 / research.md D-02 に対応。
 *
 * sessionStorage に一時保存し、注文完了画面がマウント時に読み出して即削除する
 * （一度きりの読み出し）。注文番号を画面のアドレスに含めないため、
 * アドレスの書き換えで他者の注文を閲覧する経路が生まれない（FR-029a / FR-029b）。
 */
import type { OrderResult } from "./apiClient";

export const LAST_ORDER_STORAGE_KEY = "lastOrder";

/** 注文確定の直後に保存する */
export function saveLastOrder(order: OrderResult): void {
  try {
    window.sessionStorage.setItem(
      LAST_ORDER_STORAGE_KEY,
      JSON.stringify(order),
    );
  } catch {
    // 保存できない場合、注文完了画面は注文情報を表示せず一覧へ誘導する
  }
}

/**
 * 読み出して即座に削除する。
 * 再読込・直接アクセス・ブックマークからの再訪では null になる（FR-029a）。
 */
export function consumeLastOrder(): OrderResult | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
    window.sessionStorage.removeItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as OrderResult).orderNumber !== "string"
    ) {
      return null;
    }
    return parsed as OrderResult;
  } catch {
    // 壊れている・読めない場合は「読み出せなかった」と同じ扱いにする
    return null;
  }
}
