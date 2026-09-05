// 金額計算（純関数）。整数円のみ。送料・税・割引なし（FR-012 / SC-006）。
// バックエンド backend/src/domain/pricing.ts と同一規則にすること。

export interface PricedLine {
  unitPrice: number;
  quantity: number;
}

/** 小計 = 単価 × 数量 */
export function subtotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

/** 合計 = 各明細の小計の総和 */
export function total(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + subtotal(l.unitPrice, l.quantity), 0);
}
