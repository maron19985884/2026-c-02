import { formatYen } from "@/lib/format";
import type { CartLine } from "@/lib/useCartLines";
import styles from "./OrderSummary.module.css";

/**
 * カート明細（書名・単価・数量・小計）と合計の表示（FR-009 / FR-019）。
 * カート画面・注文フォームで共用。`renderRowControls` で行ごとの操作
 * （数量ステッパー・削除、US2）を差し込める。
 */
export default function OrderSummary({
  lines,
  total,
  renderRowControls,
}: {
  lines: CartLine[];
  total: number;
  renderRowControls?: (line: CartLine) => React.ReactNode;
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">書名</th>
          <th scope="col" className={styles.num}>
            単価
          </th>
          <th scope="col" className={styles.num}>
            数量
          </th>
          <th scope="col" className={styles.num}>
            小計
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.bookId}>
            <td>
              <div className={styles.title}>{line.title}</div>
              {line.unavailable && (
                <div className={styles.unavailable}>この書籍は現在購入できません</div>
              )}
              {renderRowControls && <div className={styles.controls}>{renderRowControls(line)}</div>}
            </td>
            <td className={styles.num}>{line.unavailable ? "—" : formatYen(line.unitPrice)}</td>
            <td className={styles.num}>{line.quantity}</td>
            <td className={styles.num}>{line.unavailable ? "—" : formatYen(line.subtotal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className={styles.totalRow}>
          <td colSpan={3}>合計</td>
          <td className={styles.num}>{formatYen(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
