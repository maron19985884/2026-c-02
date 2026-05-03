import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || "appdb",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "password",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/products", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM books ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

type OrderItem = {
  book_id: number;
  title: string;
  price: number;
  quantity: number;
};

app.post("/orders", async (req, res) => {
  const { name, address, email, items } = req.body as {
    name: string;
    address: string;
    email: string;
    items: OrderItem[];
  };

  if (!name || !address || !email || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderNumber = `ORD-${Date.now()}`;

    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO orders (order_number, name, address, email, total_amount) VALUES (?, ?, ?, ?, ?)",
      [orderNumber, name, address, email, totalAmount]
    );
    const orderId = result.insertId;

    for (const item of items) {
      await conn.query<ResultSetHeader>(
        "INSERT INTO order_items (order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.book_id, item.title, item.price, item.quantity]
      );
    }

    await conn.commit();
    res.json({ order_number: orderNumber });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
