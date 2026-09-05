import mysql from "mysql2/promise";

/**
 * MySQL コネクションプール。
 * 接続情報はすべて環境変数から取得する（コードへ直書きしない / requirements.md 非機能・セキュリティ）。
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? "appdb",
  user: process.env.DB_USER ?? "appuser",
  password: process.env.DB_PASSWORD ?? "password",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  timezone: "Z",
  supportBigNumbers: true,
});

export type Pool = typeof pool;
