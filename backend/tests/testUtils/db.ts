import { ResultSetHeader } from "mysql2";

import { pool } from "../../src/config/db";

/**
 * 結合テスト用のヘルパー。
 * 実行には稼働中の MySQL（docker compose up -d mysql、または CI 用テストDB）が必要。
 * 001_schema.sql 適用済みであることを前提とする。
 * テストが作成した行はタイトルに一意なプレフィックスを付け、DELETE で後片付けする
 * （破壊的 DDL は使わない／憲法§1）。
 */

export const TEST_PREFIX = "[itest]";

export async function insertTestBook(overrides: {
  title?: string;
  author?: string;
  price?: number;
  status?: "selling" | "unlisted";
} = {}): Promise<{ id: number; title: string; price: number }> {
  const title = overrides.title ?? `${TEST_PREFIX} Book ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const author = overrides.author ?? "Test Author";
  const price = overrides.price ?? 500;
  const status = overrides.status ?? "selling";

  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO books (title, author, price, cover_image_url, description, status)
     VALUES (?, ?, ?, '/images/books/placeholder.svg', 'test description', ?)`,
    [title, author, price, status],
  );
  return { id: res.insertId, title, price };
}

export async function cleanupTestData(): Promise<void> {
  // order_items -> orders は FK CASCADE。books を先に消すと order_items.book_id は SET NULL される。
  await pool.query(`DELETE FROM order_items WHERE title_snapshot LIKE ?`, [`${TEST_PREFIX}%`]);
  await pool.query(
    `DELETE FROM orders WHERE customer_email LIKE ? OR customer_name LIKE ?`,
    [`itest.%`, `${TEST_PREFIX}%`],
  );
  await pool.query(`DELETE FROM books WHERE title LIKE ?`, [`${TEST_PREFIX}%`]);
}

export async function closePool(): Promise<void> {
  await pool.end();
}
