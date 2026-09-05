// 金額計算（純関数）。整数円のみ、丸めなし。送料・税・割引なし（FR-012 / SC-006）。
// フロントエンド frontend/src/lib/cartTotal.ts と同一規則にすること。

export interface PricedItem {
  unitPrice: number;
  quantity: number;
}

function assertNonNegativeInt(value: number, label: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer: ${value}`);
  }
}

/** 小計 = 単価 × 数量 */
export function lineSubtotal(unitPrice: number, quantity: number): number {
  assertNonNegativeInt(unitPrice, "unitPrice");
  assertNonNegativeInt(quantity, "quantity");
  return unitPrice * quantity;
}

/** 合計 = 各明細の小計の総和 */
export function orderTotal(items: PricedItem[]): number {
  return items.reduce((sum, i) => sum + lineSubtotal(i.unitPrice, i.quantity), 0);
}
