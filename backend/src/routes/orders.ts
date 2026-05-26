import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

type OrderItem = { book_id: number; quantity: number };

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
}

router.post("/", async (req: Request, res: Response) => {
  const { customer_name, address, email, items } = req.body as {
    customer_name: string;
    address: string;
    email: string;
    items: OrderItem[];
  };

  if (!customer_name || !address || !email || !items?.length) {
    res.status(400).json({ error: "必須項目が不足しています" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 書籍の現在価格を取得して合計を計算
    const bookIds = items.map((i) => i.book_id);
    const [bookRows] = await conn.query("SELECT id, price FROM books WHERE id IN (?)", [bookIds]);
    const priceMap = new Map((bookRows as any[]).map((b) => [b.id, b.price]));

    const total_amount = items.reduce((sum, item) => {
      return sum + (priceMap.get(item.book_id) ?? 0) * item.quantity;
    }, 0);

    const order_number = generateOrderNumber();

    const [orderResult] = await conn.query(
      "INSERT INTO orders (order_number, customer_name, address, email, total_amount) VALUES (?, ?, ?, ?, ?)",
      [order_number, customer_name, address, email, total_amount]
    );
    const orderId = (orderResult as any).insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.book_id, item.quantity, priceMap.get(item.book_id)]
      );
    }

    await conn.commit();
    res.status(201).json({ order_number, total_amount });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export default router;
