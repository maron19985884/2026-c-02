/**
 * カートの小計・合計の算出。
 *
 * 詳細設計書 DETAIL-004 §2.9 に対応。
 * 金額は整数の日本円のみを扱い、送料・手数料・割引は含めない
 * （FR-010 / FR-013 / research.md D-10）。
 *
 * 純関数として切り出すことで、DB やブラウザに依存せず検証できる（憲法§2）。
 */
import type { BookSummary } from "./apiClient";
import type { CartItem } from "./cartContext";

export interface CartLine {
  bookId: number;
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartTotal {
  /** 購入できる書籍の明細。カートの並び順を維持する */
  lines: CartLine[];
  /** 小計の総和 */
  total: number;
  /**
   * カートにあるが `books` に見つからなかった書籍 ID。
   * 販売停止・削除された書籍を利用者へ提示するために使う（FR-016b）。
   */
  unavailableBookIds: number[];
}

export function calcCartTotal(
  items: CartItem[],
  books: BookSummary[],
): CartTotal {
  const bookById = new Map(books.map((book) => [book.id, book]));

  const lines: CartLine[] = [];
  const unavailableBookIds: number[] = [];

  for (const item of items) {
    const book = bookById.get(item.bookId);
    if (!book) {
      // 販売停止・削除された書籍は合計に含めない（FR-016b）
      unavailableBookIds.push(item.bookId);
      continue;
    }
    lines.push({
      bookId: book.id,
      title: book.title,
      unitPrice: book.price,
      quantity: item.quantity,
      subtotal: book.price * item.quantity,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);

  return { lines, total, unavailableBookIds };
}
