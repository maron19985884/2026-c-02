import { RowDataPacket, ResultSetHeader } from "mysql2";

import { pool } from "../config/db";

export interface OrderToInsert {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  totalAmount: number;
}

export interface OrderItemToInsert {
  bookId: number | null;
  titleSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface PersistedOrder {
  orderNumber: string;
  orderedAt: string;
  customer: { name: string; address: string; email: string };
  items: {
    bookId: number | null;
    title: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
}

/** orders と order_items を単一トランザクションで書き込む。失敗時はロールバック。 */
export async function insertOrder(
  order: OrderToInsert,
  items: OrderItemToInsert[],
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders
         (order_number, customer_name, customer_address, customer_email, total_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [
        order.orderNumber,
        order.customerName,
        order.customerAddress,
        order.customerEmail,
        order.totalAmount,
      ],
    );
    const orderId = res.insertId;

    await conn.query(
      `INSERT INTO order_items
         (order_id, book_id, title_snapshot, unit_price_snapshot, quantity, subtotal)
       VALUES ?`,
      [
        items.map((i) => [
          orderId,
          i.bookId,
          i.titleSnapshot,
          i.unitPriceSnapshot,
          i.quantity,
          i.subtotal,
        ]),
      ],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** 注文番号で1件取得（補助照会 / SC-007）。存在しなければ null。 */
export async function findByOrderNumber(orderNumber: string): Promise<PersistedOrder | null> {
  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, order_number, customer_name, customer_address, customer_email,
            total_amount, ordered_at
       FROM orders
      WHERE order_number = ?`,
    [orderNumber],
  );
  const o = orderRows[0] as
    | {
        id: number;
        order_number: string;
        customer_name: string;
        customer_address: string;
        customer_email: string;
        total_amount: number;
        ordered_at: Date | string;
      }
    | undefined;
  if (!o) return null;

  const [itemRows] = await pool.query<RowDataPacket[]>(
    `SELECT book_id, title_snapshot, unit_price_snapshot, quantity, subtotal
       FROM order_items
      WHERE order_id = ?
      ORDER BY id`,
    [o.id],
  );

  return {
    orderNumber: o.order_number,
    orderedAt: new Date(o.ordered_at).toISOString(),
    customer: {
      name: o.customer_name,
      address: o.customer_address,
      email: o.customer_email,
    },
    items: (itemRows as RowDataPacket[]).map((r) => ({
      bookId: (r.book_id as number | null) ?? null,
      title: r.title_snapshot as string,
      unitPrice: r.unit_price_snapshot as number,
      quantity: r.quantity as number,
      subtotal: r.subtotal as number,
    })),
    totalAmount: o.total_amount,
  };
}
