/**
 * orders API の結合テスト（T050）。
 *
 * 検証対象:
 * - 正常系 201 とスナップショット保存（FR-024 / SC-006）
 * - 400 VALIDATION_ERROR の各パターン（SC-004）
 * - 409 BOOKS_UNAVAILABLE（FR-016b）
 * - 金額改ざん（送信値を無視しサーバ算出値を使う・FR-024）
 * - 内部 ID を応答に含めないこと（FR-029b）
 * - 失敗時に ROLLBACK されること（FR-026）
 */
import request from "supertest";

const mockConn = {
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  query: jest.fn(),
  execute: jest.fn(),
};

jest.mock("../../src/db/pool", () => ({
  pool: { query: jest.fn() },
  getConnection: jest.fn(),
}));

import { getConnection } from "../../src/db/pool";
import { app } from "../../src/index";

const mockGetConnection = getConnection as jest.Mock;

const VALID_BODY = {
  customer: {
    name: "小林 景大",
    address: "東京都千代田区丸の内1-1-1",
    email: "kobayashi@example.com",
  },
  items: [
    { bookId: 1, quantity: 2 },
    { bookId: 2, quantity: 1 },
  ],
};

const BOOK_ROWS = [
  { id: 1, title: "吾輩は猫である", price: 880 },
  { id: 2, title: "銀河鉄道の夜", price: 660 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetConnection.mockResolvedValue(mockConn);
  mockConn.query.mockReset();
  mockConn.execute.mockReset();
  // 1回目の query = 書籍の突合、2回目 = order_items の一括 INSERT
  mockConn.query
    .mockResolvedValueOnce([BOOK_ROWS])
    .mockResolvedValueOnce([{ affectedRows: 2 }]);
  mockConn.execute.mockResolvedValue([{ insertId: 42 }]);
});

describe("POST /api/orders 正常系", () => {
  it("201 と注文番号・合計・スナップショットを返す", async () => {
    const res = await request(app).post("/api/orders").send(VALID_BODY);

    expect(res.status).toBe(201);
    expect(res.body.order.orderNumber).toHaveLength(26);
    expect(res.body.order.totalAmount).toBe(880 * 2 + 660);
    expect(res.body.order.items).toEqual([
      { title: "吾輩は猫である", unitPrice: 880, quantity: 2, subtotal: 1760 },
      { title: "銀河鉄道の夜", unitPrice: 660, quantity: 1, subtotal: 660 },
    ]);
  });

  it("内部 ID (orders.id) を応答に含めない", async () => {
    const res = await request(app).post("/api/orders").send(VALID_BODY);

    // 応答に含まれるキーは3つだけ。orders.id が漏れていないことを構造で確認する
    expect(Object.keys(res.body.order).sort()).toEqual([
      "items",
      "orderNumber",
      "totalAmount",
    ]);
    expect(res.body.order).not.toHaveProperty("id");
    expect(res.body.order).not.toHaveProperty("orderId");
  });

  it("単一トランザクションで COMMIT される", async () => {
    await request(app).post("/api/orders").send(VALID_BODY);

    expect(mockConn.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mockConn.commit).toHaveBeenCalledTimes(1);
    expect(mockConn.rollback).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });

  it("order_items に注文時点の書名・単価を保存する", async () => {
    await request(app).post("/api/orders").send(VALID_BODY);

    const [sql, params] = mockConn.query.mock.calls[1];
    expect(sql).toContain("INSERT INTO order_items");
    expect(params[0]).toEqual([
      [42, 1, "吾輩は猫である", 880, 2, 1760],
      [42, 2, "銀河鉄道の夜", 660, 1, 660],
    ]);
  });

  it("書籍の突合で is_available = TRUE を条件に含める", async () => {
    await request(app).post("/api/orders").send(VALID_BODY);

    const [sql, params] = mockConn.query.mock.calls[0];
    expect(sql).toContain("is_available = TRUE");
    // プレースホルダを使用していること（tech-stack.md §8）
    expect(params).toEqual([1, 2]);
  });
});

describe("金額の改ざん防止", () => {
  it("クライアントが送った金額を無視しサーバ算出値を使う", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        ...VALID_BODY,
        totalAmount: 1,
        items: [
          { bookId: 1, quantity: 2, unitPrice: 1 },
          { bookId: 2, quantity: 1, unitPrice: 1 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.order.totalAmount).toBe(2420);
    expect(res.body.order.items[0].unitPrice).toBe(880);
  });
});

describe("400 VALIDATION_ERROR", () => {
  it("氏名が未入力なら 400 と fields.name = REQUIRED", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...VALID_BODY, customer: { ...VALID_BODY.customer, name: "" } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.fields.name).toBe("REQUIRED");
  });

  it("メール形式不正なら 400 と fields.email = INVALID_FORMAT", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        ...VALID_BODY,
        customer: { ...VALID_BODY.customer, email: "not-an-email" },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.details.fields.email).toBe("INVALID_FORMAT");
  });

  it("明細0件なら 400 と fields.items = EMPTY", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...VALID_BODY, items: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.details.fields.items).toBe("EMPTY");
  });

  it("bookId が重複していれば 400 と DUPLICATE_BOOK", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        ...VALID_BODY,
        items: [
          { bookId: 1, quantity: 1 },
          { bookId: 1, quantity: 1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.details.fields.items).toBe("DUPLICATE_BOOK");
  });

  it("検証 NG の場合は DB へ接続しない（注文を確定させない）", async () => {
    await request(app).post("/api/orders").send({ items: [] });

    expect(mockGetConnection).not.toHaveBeenCalled();
  });
});

describe("409 BOOKS_UNAVAILABLE", () => {
  it("販売停止の書籍を含むと 409 と該当 ID を返す", async () => {
    mockConn.query.mockReset();
    // 書籍2 が販売停止 = 突合結果に含まれない
    mockConn.query.mockResolvedValueOnce([[BOOK_ROWS[0]]]);

    const res = await request(app).post("/api/orders").send(VALID_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("BOOKS_UNAVAILABLE");
    expect(res.body.error.details.unavailableBookIds).toEqual([2]);
  });

  it("409 のときは注文を確定せず ROLLBACK する", async () => {
    mockConn.query.mockReset();
    mockConn.query.mockResolvedValueOnce([[BOOK_ROWS[0]]]);

    await request(app).post("/api/orders").send(VALID_BODY);

    expect(mockConn.commit).not.toHaveBeenCalled();
    expect(mockConn.rollback).toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });
});

describe("500 INTERNAL_ERROR", () => {
  it("INSERT 失敗時は ROLLBACK して 500 を返す", async () => {
    mockConn.execute.mockReset();
    mockConn.execute.mockRejectedValueOnce(
      new Error("Duplicate entry for key uk_orders_order_number"),
    );

    const res = await request(app).post("/api/orders").send(VALID_BODY);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(mockConn.rollback).toHaveBeenCalled();
    expect(mockConn.commit).not.toHaveBeenCalled();
    expect(mockConn.release).toHaveBeenCalledTimes(1);
  });

  it("エラー応答に SQL や内部情報を含めない", async () => {
    mockConn.execute.mockReset();
    mockConn.execute.mockRejectedValueOnce(
      new Error("INSERT INTO orders ... uk_orders_order_number"),
    );

    const res = await request(app).post("/api/orders").send(VALID_BODY);

    expect(JSON.stringify(res.body)).not.toContain("INSERT");
    expect(JSON.stringify(res.body)).not.toContain("uk_orders");
  });
});
