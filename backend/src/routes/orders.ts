import { Router, Request, Response } from "express";
import pool from "../db";
import { CreateOrderRequest, OrderWithItems } from "../types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// 注文番号生成（ORD-YYYYMMDDHHmmss-XXXX）
function generateOrderNumber(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${datePart}-${rand}`;
}

// 注文作成
router.post("/", async (req: Request, res: Response) => {
  const body = req.body as CreateOrderRequest;

  // バリデーション
  if (!body.customer_name?.trim()) {
    res.status(400).json({ error: "氏名は必須です" });
    return;
  }
  if (!body.customer_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
    res.status(400).json({ error: "有効なメールアドレスを入力してください" });
    return;
  }
  if (!body.customer_address?.trim()) {
    res.status(400).json({ error: "住所は必須です" });
    return;
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: "注文商品が空です" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 書籍情報を取得して合計金額計算
    let totalAmount = 0;
    const enrichedItems: { book_id: number; title: string; price: number; quantity: number }[] = [];

    for (const item of body.items) {
      const [rows] = await conn.query<RowDataPacket[]>(
        "SELECT id, title, price FROM books WHERE id = ?",
        [item.book_id]
      );
      if (rows.length === 0) {
        throw new Error(`書籍ID ${item.book_id} が見つかりません`);
      }
      const book = rows[0];
      const qty = Math.max(1, Math.floor(item.quantity));
      totalAmount += book.price * qty;
      enrichedItems.push({
        book_id: book.id,
        title: book.title,
        price: book.price,
        quantity: qty,
      });
    }

    const orderNumber = generateOrderNumber();

    // 注文レコード作成
    const [orderResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_address, total_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [orderNumber, body.customer_name.trim(), body.customer_email.trim(), body.customer_address.trim(), totalAmount]
    );
    const orderId = orderResult.insertId;

    // 注文明細作成
    for (const item of enrichedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, book_id, title, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.book_id, item.title, item.price, item.quantity]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: orderId,
      order_number: orderNumber,
      total_amount: totalAmount,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "注文の作成に失敗しました" });
  } finally {
    conn.release();
  }
});

// 注文詳細取得
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "不正なIDです" });
    return;
  }
  try {
    const [orderRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );
    if (orderRows.length === 0) {
      res.status(404).json({ error: "注文が見つかりません" });
      return;
    }
    const [itemRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id]
    );
    const result: OrderWithItems = {
      ...(orderRows[0] as any),
      items: itemRows as any[],
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "注文詳細の取得に失敗しました" });
  }
});

export default router;
