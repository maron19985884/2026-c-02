import request from "supertest";
import { RowDataPacket } from "mysql2";

import { createApp } from "../../src/app";
import { pool } from "../../src/config/db";
import { cleanupTestData, closePool, insertTestBook } from "../testUtils/db";

const app = createApp();

const customer = { name: "[itest] 山田 太郎", address: "東京都千代田区1-1-1", email: "itest.taro@example.com" };

async function countOrdersByEmail(email: string): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM orders WHERE customer_email = ?`,
    [email],
  );
  return Number((rows[0] as { cnt: number }).cnt);
}

describe("POST /api/orders (validation)", () => {
  afterAll(async () => {
    await cleanupTestData();
    await closePool();
  });

  it("name が空なら 400 かつ fields.name、注文レコードは作られない", async () => {
    const book = await insertTestBook();
    const before = await countOrdersByEmail(customer.email);

    const res = await request(app)
      .post("/api/orders")
      .send({ customer: { ...customer, name: "" }, items: [{ bookId: book.id, quantity: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
    expect(res.body.fields.name).toBeDefined();

    const after = await countOrdersByEmail(customer.email);
    expect(after).toBe(before);
  });

  it("email に @ が無ければ 400 かつ fields.email", async () => {
    const book = await insertTestBook();
    const res = await request(app)
      .post("/api/orders")
      .send({ customer: { ...customer, email: "invalid" }, items: [{ bookId: book.id, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.fields.email).toBeDefined();
  });

  it("address が空なら 400 かつ fields.address", async () => {
    const book = await insertTestBook();
    const res = await request(app)
      .post("/api/orders")
      .send({ customer: { ...customer, address: "   " }, items: [{ bookId: book.id, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.fields.address).toBeDefined();
  });

  it("items が空配列なら 400 かつ fields.items", async () => {
    const res = await request(app).post("/api/orders").send({ customer, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.fields.items).toBeDefined();
  });

  it("非実在の bookId は 400 かつ fields.items", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ bookId: 999999999, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.fields.items).toBeDefined();
  });

  it("unlisted の bookId は 400 かつ fields.items", async () => {
    const unlisted = await insertTestBook({ status: "unlisted" });
    const res = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ bookId: unlisted.id, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.fields.items).toBeDefined();
  });

  it.each([0, 100, 1.5])("quantity が %s なら 400", async (quantity) => {
    const book = await insertTestBook();
    const res = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ bookId: book.id, quantity }] });
    expect(res.status).toBe(400);
  });

  it("customer が欠落していても 500 にならず 400 になる", async () => {
    const book = await insertTestBook();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ bookId: book.id, quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it("items が欠落していても 400 になる", async () => {
    const res = await request(app).post("/api/orders").send({ customer });
    expect(res.status).toBe(400);
    expect(res.body.fields.items).toBeDefined();
  });
});
