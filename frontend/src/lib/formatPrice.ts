/**
 * 金額の表示整形。
 *
 * 金額は整数の日本円として扱う（research.md D-10）。
 * 整形は表示のみの責務で、計算には関与しない。
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ja-JP")} 円`;
}
