import request from "supertest";

import { createApp } from "../../src/app";
import { cleanupTestData, closePool, insertTestBook } from "../testUtils/db";

const app = createApp();

const customer = { name: "[itest] 山田 太郎", address: "東京都千代田区1-1-1", email: "itest.taro@example.com" };

describe("POST /api/orders (happy path)", () => {
  afterAll(async () => {
    await cleanupTestData();
    await closePool();
  });

  it("201・totalAmount がサーバ再計算と一致・スナップショット保存・orderNumber は毎回一意", async () => {
    const bookA = await insertTestBook({ price: 780 });
    const bookB = await insertTestBook({ price: 690 });

    const res = await request(app)
      .post("/api/orders")
      .send({
        customer,
        items: [
          { bookId: bookA.id, quantity: 2 },
          { bookId: bookB.id, quantity: 1 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(780 * 2 + 690 * 1);
    expect(res.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ bookId: bookA.id, title: bookA.title, unitPrice: 780, quantity: 2, subtotal: 1560 }),
        expect.objectContaining({ bookId: bookB.id, title: bookB.title, unitPrice: 690, quantity: 1, subtotal: 690 }),
      ]),
    );
    expect(res.body.orderNumber).toMatch(/^ORD-[0-9A-HJKMNP-TV-Z]{26}$/);

    const res2 = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ bookId: bookA.id, quantity: 1 }] });
    expect(res2.status).toBe(201);
    expect(res2.body.orderNumber).not.toBe(res.body.orderNumber);
  });

  it("リクエストに unitPrice/totalAmount を含めてもサーバ値で上書きされる", async () => {
    const book = await insertTestBook({ price: 500 });

    const res = await request(app)
      .post("/api/orders")
      .send({
        customer,
        items: [{ bookId: book.id, quantity: 2, unitPrice: 1, totalAmount: 999999 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(1000);
    expect(res.body.items[0].unitPrice).toBe(500);
  });

  it("GET /api/orders/:orderNumber が作成した内容と一致する", async () => {
    const book = await insertTestBook({ price: 300 });
    const created = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ bookId: book.id, quantity: 1 }] });

    const fetched = await request(app).get(`/api/orders/${created.body.orderNumber}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);
  });

  it("GET /api/orders/:orderNumber で存在しない注文番号は 404", async () => {
    const res = await request(app).get("/api/orders/ORD-DOES-NOT-EXIST");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});
