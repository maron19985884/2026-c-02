import { ResultSetHeader } from 'mysql2';
import { pool } from '../db';

export interface OrderItem {
  book_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_address: string;
  customer_email: string;
  created_at: Date;
}

function generateOrderNumber(id: number): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${date}-${String(id).padStart(6, '0')}`;
}

export async function createOrder(
  customerName: string,
  customerAddress: string,
  customerEmail: string,
  items: OrderItem[]
): Promise<string> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 注文レコードをプレースホルダーの注文番号で挿入
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO orders (order_number, customer_name, customer_address, customer_email) VALUES (?, ?, ?, ?)',
      [`TEMP-${Date.now()}`, customerName, customerAddress, customerEmail]
    );

    const orderId = result.insertId;
    const orderNumber = generateOrderNumber(orderId);

    // 採番した注文番号で更新
    await connection.execute(
      'UPDATE orders SET order_number = ? WHERE id = ?',
      [orderNumber, orderId]
    );

    // 注文アイテムを一括挿入
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.unit_price]
      );
    }

    await connection.commit();
    return orderNumber;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
