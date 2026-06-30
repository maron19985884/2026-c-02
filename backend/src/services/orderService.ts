import pool from "../db";
import { CreateOrderRequest, CreateOrderResponse } from "../types/api";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface OrderRow extends RowDataPacket {
  id: number;
}

export async function createOrder(
  req: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders (order_number, customer_name, address, email, total_amount)
       VALUES ('TEMP', ?, ?, ?, ?)`,
      [req.customerName, req.address, req.email, req.totalAmount]
    );

    const orderId = result.insertId;
    const orderNumber = `ORD-${String(orderId).padStart(6, "0")}`;

    await conn.query(
      "UPDATE orders SET order_number = ? WHERE id = ?",
      [orderNumber, orderId]
    );

    for (const item of req.items) {
      await conn.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.bookId, item.quantity, item.unitPrice]
      );
    }

    await conn.commit();
    return { orderNumber };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
