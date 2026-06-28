import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string | null;
  image_url: string | null;
}

export async function findAll(): Promise<Book[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, author, price, description, image_url FROM books'
  );
  return rows as Book[];
}

export async function findById(id: number): Promise<Book | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, author, price, description, image_url FROM books WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Book) : null;
}
