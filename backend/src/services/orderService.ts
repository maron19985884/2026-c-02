/**
 * 注文作成のトランザクション制御。
 *
 * 詳細設計書 DETAIL-004 §2.5 / §4.1 に対応。
 *
 * 手順:
 *   1. 接続を取得しトランザクションを開始
 *   2. 対象書籍の実在・販売状態を確認（FR-016b）
 *   3. サーバ側で金額を算出し、注文番号を発行（FR-023 / FR-024）
 *   4. orders → order_items を INSERT し COMMIT
 *   5. 途中失敗時は ROLLBACK し、部分的な注文を残さない（FR-025 / FR-026）
 *
 * 全クエリで mysql2 のプレースホルダを使用する（tech-stack.md §8）。
 */
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConnection } from "../db/pool";
import { calcOrderTotal, type PricedBook } from "../domain/calcOrderTotal";
import { generateOrderNumber } from "../domain/generateOrderNumber";
import type { CustomerInput, OrderItemInput, OrderResult } from "../types";

/** 販売停止・削除された書籍が含まれる場合の例外（409 に対応） */
export class BooksUnavailableError extends Error {
  readonly unavailableBookIds: number[];

  constructor(unavailableBookIds: number[]) {
    super("ご注文いただけない書籍が含まれています");
    this.name = "BooksUnavailableError";
    this.unavailableBookIds = unavailableBookIds;
  }
}

interface PricedBookRow extends RowDataPacket {
  id: number;
  title: string;
  price: number;
}

export async function createOrder(
  customer: CustomerInput,
  items: OrderItemInput[],
): Promise<OrderResult> {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    // --- 2. 対象書籍の実在・販売状態を確認 ---
    // 突合をトランザクション内で行うことで、突合と INSERT の間に
    // 販売状態が変わっても整合が保たれる
    const bookIds = items.map((item) => item.bookId);
    const placeholders = bookIds.map(() => "?").join(", ");
    const [rows] = await conn.query<PricedBookRow[]>(
      `SELECT id, title, price
         FROM books
        WHERE id IN (${placeholders}) AND is_available = TRUE`,
      bookIds,
    );

    const found = new Set(rows.map((row) => row.id));
    const unavailable = bookIds.filter((id) => !found.has(id));
    if (unavailable.length > 0) {
      await conn.rollback();
      throw new BooksUnavailableError(unavailable);
    }

    // --- 3. 金額の算出と注文番号の発行（DB アクセスなし） ---
    const books: PricedBook[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      price: row.price,
    }));
    const { items: snapshots, totalAmount } = calcOrderTotal(books, items);
    const orderNumber = generateOrderNumber();

    // --- 4. orders → order_items を INSERT ---
    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders
         (order_number, customer_name, customer_address, customer_email, total_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customer.name.trim(),
        customer.address.trim(),
        customer.email.trim(),
        totalAmount,
      ],
    );
    const orderId = orderResult.insertId;

    // title / unitPrice は books の値をコピーして保存する。
    // 以後 books が変わっても注文記録は変化しない（FR-024 / SC-006）
    const values = snapshots.map((snapshot, index) => [
      orderId,
      items[index].bookId,
      snapshot.title,
      snapshot.unitPrice,
      snapshot.quantity,
      snapshot.subtotal,
    ]);
    await conn.query(
      `INSERT INTO order_items
         (order_id, book_id, title, unit_price, quantity, subtotal)
       VALUES ?`,
      [values],
    );

    await conn.commit();

    return { orderNumber, totalAmount, items: snapshots };
  } catch (err) {
    // BooksUnavailableError は上で rollback 済み。二重 rollback は無害だが、
    // 失敗しても元の例外を握りつぶさないようにする
    try {
      await conn.rollback();
    } catch {
      // rollback 自体の失敗は元の例外より優先しない
    }
    throw err;
  } finally {
    conn.release();
  }
}
