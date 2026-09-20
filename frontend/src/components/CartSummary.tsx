/**
 * 注文内容（書名・単価・数量・小計）と合計金額の表示。
 *
 * 詳細設計書 DETAIL-004 §2.12 に対応。
 * 数量操作の表示有無を `editable` で切り替え、カート画面では操作あり、
 * 注文フォーム画面では表示のみで用いる。合計金額の表示経路を1本に保つことで、
 * 2画面の金額が食い違わないようにする（FR-010 / FR-013 / FR-021 / SC-003）。
 */
"use client";

import type { CartLine } from "@/lib/calcCartTotal";
import { formatPrice } from "@/lib/formatPrice";
import styles from "./CartSummary.module.css";

interface CartSummaryProps {
  lines: CartLine[];
  total: number;
  /** true でカート画面用（数量の増減・削除を表示）、false で注文フォーム用（表示のみ） */
  editable?: boolean;
  onChangeQuantity?: (bookId: number, quantity: number) => void;
  onRemove?: (bookId: number) => void;
  caption?: string;
}

export default function CartSummary({
  lines,
  total,
  editable = false,
  onChangeQuantity,
  onRemove,
  caption,
}: CartSummaryProps) {
  return (
    <div>
      <table className={styles.table}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">書名</th>
            <th scope="col" className={styles.numeric}>
              単価
            </th>
            <th scope="col">数量</th>
            <th scope="col" className={styles.numeric}>
              小計
            </th>
            {editable && <th scope="col" className="visuallyHidden">操作</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.bookId}>
              <th scope="row">{line.title}</th>
              <td className={styles.numeric}>{formatPrice(line.unitPrice)}</td>
              <td>
                {editable ? (
                  <span className={styles.quantityControl}>
                    <button
                      type="button"
                      className={styles.stepper}
                      aria-label={`${line.title} の数量を1減らす`}
                      onClick={() =>
                        onChangeQuantity?.(line.bookId, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className={styles.quantityValue}>{line.quantity}</span>
                    <button
                      type="button"
                      className={styles.stepper}
                      aria-label={`${line.title} の数量を1増やす`}
                      onClick={() =>
                        onChangeQuantity?.(line.bookId, line.quantity + 1)
                      }
                    >
                      ＋
                    </button>
                  </span>
                ) : (
                  <span>{line.quantity}</span>
                )}
              </td>
              <td className={styles.numeric}>{formatPrice(line.subtotal)}</td>
              {editable && (
                <td>
                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label={`${line.title} をカートから削除する`}
                    onClick={() => onRemove?.(line.bookId)}
                  >
                    削除
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.totalRow}>
            <th scope="row" colSpan={3}>
              合計
            </th>
            <td className={styles.numeric} data-testid="cart-total">
              {formatPrice(total)}
            </td>
            {editable && <td />}
          </tr>
        </tfoot>
      </table>
      <p className={styles.note}>
        表示価格は税込です。送料・手数料は含みません。
      </p>
    </div>
  );
}
