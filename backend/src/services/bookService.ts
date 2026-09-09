import type { RowDataPacket } from "mysql2";
import pool from "../db/pool";
import type { Book, BookListItem } from "../types/book";

interface BookRow extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
}

interface BookDetailRow extends BookRow {
  description: string | null;
}

export async function fetchBooks(): Promise<BookListItem[]> {
  const [rows] = await pool.query<BookRow[]>(
    "SELECT id, title, author, price, image_url FROM books ORDER BY id ASC"
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    imageUrl: row.image_url,
  }));
}

export async function fetchBookById(id: number): Promise<Book | null> {
  const [rows] = await pool.query<BookDetailRow[]>(
    "SELECT id, title, author, price, description, image_url FROM books WHERE id = ?",
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
    imageUrl: row.image_url,
  };
}
