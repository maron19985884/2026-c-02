import mysql from 'mysql2/promise';
import pool from './pool';
import type { OrderRow, OrderItemRow, OrderItemRequest, ProductRow } from '../types';

/**
 * 注文を作成する（トランザクション使用）
 * 1. orders テーブルに仮値でINSERT
 * 2. lastInsertId から order_number を生成してUPDATE
 * 3. order_items テーブルに各明細をINSERT
 * 4. コミット。エラー時はロールバック
 */
export async function createOrderWithItems(
  customerName:    string,
  customerAddress: string,
  customerEmail:   string,
  totalAmount:     number,
  items:           OrderItemRequest[],
  products:        ProductRow[]
): Promise<OrderRow> {
  // プールからコネクションを取得しトランザクションを開始する
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // orders テーブルに仮値 '' でINSERT（order_number は後でUPDATEする）
    const [insertResult] = await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO orders (order_number, customer_name, customer_address, customer_email, total_amount)
       VALUES ('', ?, ?, ?, ?)`,
      [customerName, customerAddress, customerEmail, totalAmount]
    );
    const orderId = insertResult.insertId;

    // 注文番号を生成: ORD- + 10桁ゼロ埋めID
    const orderNumber = 'ORD-' + orderId.toString().padStart(10, '0');

    // order_number を UPDATE する
    await connection.execute(
      'UPDATE orders SET order_number = ? WHERE id = ?',
      [orderNumber, orderId]
    );

    // 商品マップを作成してIDから情報を素早く引けるようにする
    const productMap = new Map<number, ProductRow>();
    for (const p of products) {
      productMap.set(p.id, p);
    }

    // order_items を1行ずつINSERT（titleとpriceはスナップショット値を使用）
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      const subtotal = product.price * item.quantity;
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, product.title, product.price, item.quantity, subtotal]
      );
    }

    // トランザクションをコミットする
    await connection.commit();

    // 作成した注文を返す
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id, order_number, customer_name, customer_address, customer_email, total_amount, created_at, updated_at FROM orders WHERE id = ?',
      [orderId]
    );
    const orderRows = rows as OrderRow[];
    return orderRows[0];
  } catch (err) {
    // エラー発生時はロールバックしてエラーを再スローする
    await connection.rollback();
    throw err;
  } finally {
    // 必ずコネクションをプールに返却する
    connection.release();
  }
}

/**
 * IDで注文を1件取得する
 * 存在しない場合は undefined を返す
 */
export async function getOrderById(id: number): Promise<OrderRow | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT id, order_number, customer_name, customer_address, customer_email, total_amount, created_at
     FROM orders
     WHERE id = ?`,
    [id]
  );
  const results = rows as OrderRow[];
  return results.length > 0 ? results[0] : undefined;
}

/**
 * 注文IDに紐づく注文明細を取得する
 */
export async function getOrderItemsByOrderId(orderId: number): Promise<OrderItemRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.title, oi.price, oi.quantity, oi.subtotal, oi.created_at
     FROM order_items oi
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows as OrderItemRow[];
}
