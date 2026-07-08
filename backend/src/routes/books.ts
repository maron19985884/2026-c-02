import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM books ORDER BY id");
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [req.params.id]);
  const books = rows as RowDataPacket[];
  if (books.length === 0) {
    res.status(404).json({ error: "書籍が見つかりません" });
    return;
  }
  res.json(books[0]);
});

export default router;
