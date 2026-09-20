/**
 * 注文金額の算出とスナップショット化。
 *
 * 詳細設計書 DETAIL-004 §2.4 に対応。
 *
 * `books` から取得した単価と数量から、明細の小計と注文全体の合計を求める。
 * ここで作った title / unitPrice がそのまま `order_items` に保存され、
 * 以後 `books` が変わっても注文記録は変化しない（FR-024 / SC-006）。
 *
 * クライアントから送られた金額は使わない（改ざん防止）。
 * 整数の円のみを扱う（research.md D-10）。
 */
import type { OrderItemInput, OrderItemSnapshot } from "../types";

/** 金額算出に必要な最小限の書籍情報 */
export interface PricedBook {
  id: number;
  title: string;
  price: number;
}

export interface OrderTotal {
  items: OrderItemSnapshot[];
  totalAmount: number;
}

export function calcOrderTotal(
  books: PricedBook[],
  items: OrderItemInput[],
): OrderTotal {
  const bookById = new Map(books.map((book) => [book.id, book]));

  const snapshots: OrderItemSnapshot[] = items.map((item) => {
    const book = bookById.get(item.bookId);
    if (!book) {
      // 呼び出し元（orderService）が事前に突合しているため、
      // ここに到達するのは実装の不整合
      throw new Error(`書籍が見つかりません: bookId=${item.bookId}`);
    }
    return {
      title: book.title,
      unitPrice: book.price,
      quantity: item.quantity,
      subtotal: book.price * item.quantity,
    };
  });

  const totalAmount = snapshots.reduce((sum, s) => sum + s.subtotal, 0);

  return { items: snapshots, totalAmount };
}
