import mysql from 'mysql2/promise';
import pool from './pool';
import type { ProductRow } from '../types';

/**
 * 全商品を取得する
 * ORDER BY id ASC で安定した順序で返す
 */
export async function getAllProducts(): Promise<ProductRow[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, title, author, price, image_url, description, created_at, updated_at FROM products ORDER BY id ASC'
  );
  return rows as ProductRow[];
}

/**
 * IDで商品を1件取得する
 * 存在しない場合は undefined を返す
 */
export async function getProductById(id: number): Promise<ProductRow | undefined> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, title, author, price, image_url, description, created_at, updated_at FROM products WHERE id = ?',
    [id]
  );
  const results = rows as ProductRow[];
  return results.length > 0 ? results[0] : undefined;
}

/**
 * 複数のIDで商品を取得する（注文作成時の存在確認・価格取得に使用）
 * IN句を使用してバッチ取得する
 */
export async function getProductsByIds(ids: number[]): Promise<ProductRow[]> {
  if (ids.length === 0) return [];
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, title, price FROM products WHERE id IN (?)',
    [ids]
  );
  return rows as ProductRow[];
}
