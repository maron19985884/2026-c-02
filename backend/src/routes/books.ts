import { Router, Request, Response } from "express";
import pool from "../db";
import { Book } from "../types";
import { RowDataPacket } from "mysql2";

const router = Router();

// 書籍一覧取得
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM books ORDER BY id ASC"
    );
    res.json(rows as Book[]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "書籍一覧の取得に失敗しました" });
  }
});

// 書籍詳細取得
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "不正なIDです" });
    return;
  }
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "書籍が見つかりません" });
      return;
    }
    res.json(rows[0] as Book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "書籍詳細の取得に失敗しました" });
  }
});

export default router;
