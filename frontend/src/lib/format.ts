const yen = new Intl.NumberFormat("ja-JP");

/** 整数円を「¥1,560」形式に整形する（D-09）。 */
export function formatYen(value: number): string {
  return `¥${yen.format(value)}`;
}
