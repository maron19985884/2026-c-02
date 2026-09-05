import request from "supertest";
import { RowDataPacket } from "mysql2";

import { createApp } from "../../src/app";
import { pool } from "../../src/config/db";
import { cleanupTestData, closePool, insertTestBook } from "../testUtils/db";

/**
 * 稼働中の MySQL（001_schema.sql 適用済み）が必要。
 * 例: docker compose up -d mysql （その後 DB_HOST=localhost 等で環境変数を設定して実行）
 */
const app = createApp();

async function countSelling(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM books WHERE status = 'selling'`,
  );
  return Number((rows[0] as { cnt: number }).cnt);
}

describe("GET /api/books", () => {
  afterAll(async () => {
    await cleanupTestData();
    await closePool();
  });

  it("既定（クエリなし）で page=1, pageSize=12 として最大12件返る", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(12);
    expect(res.body.items.length).toBeLessThanOrEqual(12);
  });

  it("totalItems/totalPages が販売中書籍数と一致する", async () => {
    const expected = await countSelling();
    const res = await request(app).get("/api/books?pageSize=12");
    expect(res.body.totalItems).toBe(expected);
    expect(res.body.totalPages).toBe(expected === 0 ? 0 : Math.ceil(expected / 12));
  });

  it("unlisted の書籍は一覧に含まれない", async () => {
    const unlisted = await insertTestBook({ status: "unlisted", price: 999 });
    const res = await request(app).get("/api/books?pageSize=48");
    const found = (res.body.items as { id: number }[]).some((b) => b.id === unlisted.id);
    expect(found).toBe(false);
  });

  it("page=999（範囲外）で最終ページの items と丸めた page が返る", async () => {
    const res = await request(app).get("/api/books?page=999&pageSize=12");
    expect(res.status).toBe(200);
    if (res.body.totalPages > 0) {
      expect(res.body.page).toBe(res.body.totalPages);
      expect(res.body.items.length).toBeGreaterThan(0);
    }
  });

  it("pageSize=0 は 400", async () => {
    const res = await request(app).get("/api/books?pageSize=0");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("pageSize=100 は 400", async () => {
    const res = await request(app).get("/api/books?pageSize=100");
    expect(res.status).toBe(400);
  });

  it("レスポンスに description が含まれない", async () => {
    const res = await request(app).get("/api/books");
    for (const item of res.body.items as Record<string, unknown>[]) {
      expect(item).not.toHaveProperty("description");
    }
  });
});

describe("GET /api/books/:id", () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  it("実在する販売中書籍で全フィールド（description 含む）が返る", async () => {
    const book = await insertTestBook({ price: 1234 });
    const res = await request(app).get(`/api/books/${book.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: book.id, title: book.title, price: 1234 });
    expect(res.body).toHaveProperty("description");
  });

  it("存在しない id は 404", async () => {
    const res = await request(app).get("/api/books/999999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });

  it("unlisted の書籍 id は 404", async () => {
    const book = await insertTestBook({ status: "unlisted" });
    const res = await request(app).get(`/api/books/${book.id}`);
    expect(res.status).toBe(404);
  });

  it("id=abc は 400", async () => {
    const res = await request(app).get("/api/books/abc");
    expect(res.status).toBe(400);
  });
});
