/**
 * 書籍参照の REST API。
 *
 * 詳細設計書 DETAIL-004 §2.6 / contracts/books-api.md に対応。
 * いずれも `is_available = TRUE` で絞り、販売停止の書籍を外部に出さない
 * （FR-001a / FR-005a）。
 */
import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/pool";
import { Book, BookSummary, HttpError } from "../types";

export const booksRouter = Router();

interface BookRow extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  cover_image_url: string | null;
}

function toSummary(row: BookRow): BookSummary {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    coverImageUrl: row.cover_image_url,
  };
}

function toBook(row: BookRow): Book {
  return { ...toSummary(row), description: row.description };
}

/**
 * GET /api/books — 販売中の書籍を全件取得する。
 *
 * - `is_available = TRUE` のみ（FR-001a）
 * - 件数で区切らず全件（FR-001c）
 * - `id` 昇順で順序を固定（FR-001d）
 * - 0件でも 200 と空配列。404 にしない（FR-004）
 */
booksRouter.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query<BookRow[]>(
      `SELECT id, title, author, price, cover_image_url
         FROM books
        WHERE is_available = TRUE
        ORDER BY id ASC`,
    );
    res.json({ books: rows.map(toSummary) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/books/:id — 書籍詳細を取得する。
 *
 * 不存在・販売停止・`id` 不正のいずれも 404 `BOOK_NOT_FOUND` で統一して返す。
 * 3条件を区別しないのは、存在の有無を外部に漏らさないため（FR-005a）。
 */
booksRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(404, "BOOK_NOT_FOUND", "該当の書籍が見つかりません");
    }

    const [rows] = await pool.query<BookRow[]>(
      `SELECT id, title, author, price, description, cover_image_url
         FROM books
        WHERE id = ? AND is_available = TRUE`,
      [id],
    );

    const row = rows[0];
    if (!row) {
      throw new HttpError(404, "BOOK_NOT_FOUND", "該当の書籍が見つかりません");
    }

    res.json({ book: toBook(row) });
  } catch (err) {
    next(err);
  }
});
