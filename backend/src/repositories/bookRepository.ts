import type { RowDataPacket } from "mysql2";
import pool from "../db/pool";
import type { Book, BookSummary } from "../types/book";

export async function listForSale(): Promise<BookSummary[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, title, author, price, cover_image_url FROM books WHERE is_for_sale = 1 ORDER BY created_at DESC, id DESC"
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    coverImageUrl: row.cover_image_url,
  }));
}

export async function getById(id: number): Promise<Book | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, title, author, price, description, cover_image_url FROM books WHERE id = ? AND is_for_sale = 1",
    [id]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    description: row.description,
    coverImageUrl: row.cover_image_url,
  };
}
