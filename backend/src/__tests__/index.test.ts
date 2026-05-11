// mysql2/promise をモック（app インポート前に宣言する）
const mockQuery = jest.fn();
const mockBeginTransaction = jest.fn();
const mockConnQuery = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();
const mockRelease = jest.fn();
const mockGetConnection = jest.fn();

jest.mock("mysql2/promise", () => ({
  createPool: jest.fn(() => ({
    query: mockQuery,
    getConnection: mockGetConnection,
  })),
}));

import request from "supertest";
import app from "../index";

beforeEach(() => {
  jest.clearAllMocks();
  mockGetConnection.mockResolvedValue({
    beginTransaction: mockBeginTransaction,
    query: mockConnQuery,
    commit: mockCommit,
    rollback: mockRollback,
    release: mockRelease,
  });
});

describe("GET /health", () => {
  it("{ status: 'ok' } を 200 で返す", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /products", () => {
  it("書籍一覧を 200 で返す", async () => {
    const books = [
      { id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 },
      { id: 2, title: "React 実践", author: "著者B", price: 3200 },
    ];
    mockQuery.mockResolvedValueOnce([books, []]);

    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(books);
    expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM books ORDER BY id");
  });

  it("DB エラー時に 500 を返す", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/products");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});

describe("GET /products/:id", () => {
  it("書籍が見つかった場合に 200 で返す", async () => {
    const book = { id: 1, title: "TypeScript 入門", author: "著者A", price: 2800 };
    mockQuery.mockResolvedValueOnce([[book], []]);

    const res = await request(app).get("/products/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(book);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM books WHERE id = ?",
      ["1"]
    );
  });

  it("書籍が見つからない場合に 404 を返す", async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const res = await request(app).get("/products/9999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not Found" });
  });

  it("DB エラー時に 500 を返す", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/products/1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});

describe("POST /orders", () => {
  const validBody = {
    name: "山田 太郎",
    address: "東京都渋谷区1-1-1",
    email: "taro@example.com",
    items: [
      { book_id: 1, title: "TypeScript 入門", price: 2800, quantity: 2 },
      { book_id: 2, title: "React 実践", price: 3200, quantity: 1 },
    ],
  };

  it("注文を作成し order_number を 200 で返す", async () => {
    mockConnQuery
      .mockResolvedValueOnce([{ insertId: 42 }, []])
      .mockResolvedValueOnce([{}, []])
      .mockResolvedValueOnce([{}, []]);

    const res = await request(app).post("/orders").send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("order_number");
    expect(res.body.order_number).toMatch(/^ORD-\d+$/);
    expect(mockBeginTransaction).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it("アイテム数分だけ order_items に INSERT する", async () => {
    mockConnQuery
      .mockResolvedValueOnce([{ insertId: 10 }, []])
      .mockResolvedValueOnce([{}, []])
      .mockResolvedValueOnce([{}, []]);

    await request(app).post("/orders").send(validBody);

    // orders INSERT + order_items INSERT × 2 = 合計 3 回
    expect(mockConnQuery).toHaveBeenCalledTimes(3);
  });

  it("合計金額を正しく計算して INSERT する (2800×2 + 3200×1 = 8800)", async () => {
    mockConnQuery
      .mockResolvedValueOnce([{ insertId: 99 }, []])
      .mockResolvedValueOnce([{}, []])
      .mockResolvedValueOnce([{}, []]);

    await request(app).post("/orders").send(validBody);

    expect(mockConnQuery).toHaveBeenNthCalledWith(
      1,
      "INSERT INTO orders (order_number, name, address, email, total_amount) VALUES (?, ?, ?, ?, ?)",
      [expect.stringMatching(/^ORD-\d+$/), "山田 太郎", "東京都渋谷区1-1-1", "taro@example.com", 8800]
    );
  });

  it("name が空の場合に 400 を返す", async () => {
    const res = await request(app).post("/orders").send({ ...validBody, name: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("address が空の場合に 400 を返す", async () => {
    const res = await request(app).post("/orders").send({ ...validBody, address: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("email が空の場合に 400 を返す", async () => {
    const res = await request(app).post("/orders").send({ ...validBody, email: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("items が配列でない場合に 400 を返す", async () => {
    const res = await request(app).post("/orders").send({ ...validBody, items: "invalid" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("items が空配列の場合に 400 を返す", async () => {
    const res = await request(app).post("/orders").send({ ...validBody, items: [] });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
  });

  it("トランザクション中に DB エラーが発生した場合に rollback して 500 を返す", async () => {
    mockConnQuery.mockRejectedValueOnce(new Error("DB error during INSERT"));

    const res = await request(app).post("/orders").send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});
