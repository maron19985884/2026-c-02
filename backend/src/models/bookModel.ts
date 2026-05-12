import { RowDataPacket } from 'mysql2';
import pool from '../db';
import { Book } from '../types';

export async function findAllBooks(): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM books ORDER BY id ASC');
  return rows as Book[];
}

export async function findBookById(id: number): Promise<Book | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM books WHERE id = ?',
    [id]
  );
  return (rows[0] as Book) ?? null;
}
