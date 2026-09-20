/**
 * MySQL コネクションプール。
 *
 * 詳細設計書 DETAIL-004 §2.1 に対応。
 * 接続情報は環境変数からのみ取得し、ソースコードへ直書きしない（tech-stack.md §8）。
 */
import mysql from "mysql2/promise";

/** 必須の環境変数を取得する。未設定なら起動時に停止させる（設定漏れを黙って動かさない） */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `環境変数 ${name} が設定されていません。.env を確認してください（.env.example からコピーします）`,
    );
  }
  return value;
}

const DB_PORT = Number(process.env.DB_PORT ?? 3306);
if (!Number.isInteger(DB_PORT) || DB_PORT <= 0) {
  throw new Error(`環境変数 DB_PORT が数値として不正です: ${process.env.DB_PORT}`);
}

export const pool = mysql.createPool({
  host: requireEnv("DB_HOST"),
  port: DB_PORT,
  database: requireEnv("DB_NAME"),
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

/**
 * トランザクション用に接続を1本取り出す。
 * 呼び出し側は必ず finally で `release()` すること（DETAIL-004 §4.1）。
 */
export function getConnection(): Promise<mysql.PoolConnection> {
  return pool.getConnection();
}
