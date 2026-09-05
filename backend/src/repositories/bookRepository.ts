import { RowDataPacket } from "mysql2";

import { pool } from "../config/db";

export interface BookRow {
  id: number;
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
  description: string;
  status: "selling" | "unlisted";
}

/** 販売中書籍を id 昇順で1ページ分取得し、総数も返す。 */
export async function findSellingPage(
  page: number,
  pageSize: number,
): Promise<{ rows: BookRow[]; totalItems: number }> {
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, author, price, cover_image_url, description, status
       FROM books
      WHERE status = 'selling'
      ORDER BY id
      LIMIT ? OFFSET ?`,
    [pageSize, offset],
  );

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM books WHERE status = 'selling'`,
  );
  const totalItems = Number((countRows[0] as { cnt: number }).cnt);

  return { rows: rows as BookRow[], totalItems };
}

/** 販売中書籍を1件取得。存在しない/unlisted なら null。 */
export async function findSellingById(id: number): Promise<BookRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, author, price, cover_image_url, description, status
       FROM books
      WHERE id = ? AND status = 'selling'`,
    [id],
  );
  const row = (rows as BookRow[])[0];
  return row ?? null;
}

/** 注文作成時に、指定 id 群の販売中書籍の現在値を取得（id -> BookRow）。 */
export async function findSellingByIds(ids: number[]): Promise<Map<number, BookRow>> {
  if (ids.length === 0) return new Map();
  const placeholders = ids.map(() => "?").join(", ");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, author, price, cover_image_url, description, status
       FROM books
      WHERE id IN (${placeholders}) AND status = 'selling'`,
    ids,
  );
  const map = new Map<number, BookRow>();
  for (const r of rows as BookRow[]) map.set(r.id, r);
  return map;
}
