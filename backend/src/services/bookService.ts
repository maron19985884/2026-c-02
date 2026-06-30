import pool from "../db";
import { Book } from "../types/api";
import { RowDataPacket } from "mysql2";

interface BookRow extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const [rows] = await pool.query<BookRow[]>("SELECT * FROM books ORDER BY id");
  return rows.map(toBook);
}

export async function getBookById(id: number): Promise<Book | null> {
  const [rows] = await pool.query<BookRow[]>(
    "SELECT * FROM books WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  return toBook(rows[0]);
}
