import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db';
import { CreateOrderRequest, Order, OrderWithItems } from '../types';

export async function createOrder(req: CreateOrderRequest): Promise<Order> {
  const total_amount = req.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.execute<ResultSetHeader>(
      'INSERT INTO orders (customer_name, customer_address, customer_email, total_amount) VALUES (?, ?, ?, ?)',
      [req.customer_name, req.customer_address, req.customer_email, total_amount]
    );
    const orderId = orderResult.insertId;

    for (const item of req.items) {
      await conn.execute(
        'INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.unit_price]
      );
    }

    await conn.commit();

    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    return rows[0] as Order;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function findOrderById(id: number): Promise<OrderWithItems | null> {
  const [orderRows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM orders WHERE id = ?',
    [id]
  );
  if (!orderRows[0]) return null;

  const order = orderRows[0] as Order;
  const [itemRows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.book_id, oi.quantity, oi.unit_price, b.title
     FROM order_items oi
     JOIN books b ON oi.book_id = b.id
     WHERE oi.order_id = ?`,
    [id]
  );

  return { ...order, items: itemRows as OrderWithItems['items'] };
}
