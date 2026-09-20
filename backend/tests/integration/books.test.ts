/**
 * books API の結合テスト（T021）。
 *
 * 検証対象:
 * - 一覧が販売中のみを返すこと（FR-001a / SC-015）
 * - 一覧が id 昇順であること（FR-001d）
 * - 該当0件でも 200 と空配列であること（FR-004）
 * - 詳細の 200 と 404（販売停止・不存在・id 不正）（FR-005 / FR-005a）
 *
 * DB へは接続せず、`pool.query` をモックして検証する。
 * 実データでの確認は quickstart.md §6 の受け入れ確認で行う。
 */
import request from "supertest";

jest.mock("../../src/db/pool", () => ({
  pool: { query: jest.fn() },
  getConnection: jest.fn(),
}));

import { pool } from "../../src/db/pool";
import { app } from "../../src/index";

const query = pool.query as jest.Mock;

const ROW_1 = {
  id: 1,
  title: "吾輩は猫である",
  author: "夏目漱石",
  price: 880,
  description: "猫の視点から描いた長編小説。",
  cover_image_url: "https://example.com/1.png",
};
const ROW_2 = {
  id: 2,
  title: "銀河鉄道の夜",
  author: "宮沢賢治",
  price: 660,
  description: "幻想的な旅の物語。",
  cover_image_url: null,
};

beforeEach(() => {
  query.mockReset();
});

describe("GET /api/books", () => {
  it("販売中の書籍を id 昇順で返す", async () => {
    query.mockResolvedValueOnce([[ROW_1, ROW_2]]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(2);
    expect(res.body.books.map((b: { id: number }) => b.id)).toEqual([1, 2]);

    // 販売状態の絞り込みと並び順が SQL に含まれていること
    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain("is_available = TRUE");
    expect(sql).toContain("ORDER BY id ASC");
  });

  it("一覧では description を返さない", async () => {
    query.mockResolvedValueOnce([[ROW_1]]);

    const res = await request(app).get("/api/books");

    expect(res.body.books[0]).not.toHaveProperty("description");
    expect(res.body.books[0]).toEqual({
      id: 1,
      title: "吾輩は猫である",
      author: "夏目漱石",
      price: 880,
      coverImageUrl: "https://example.com/1.png",
    });
  });

  it("書影がない書籍は coverImageUrl が null になる", async () => {
    query.mockResolvedValueOnce([[ROW_2]]);

    const res = await request(app).get("/api/books");

    expect(res.body.books[0].coverImageUrl).toBeNull();
  });

  it("該当0件でも 200 と空配列を返す（404 にしない）", async () => {
    query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([]);
  });

  it("クエリ失敗時は 500 INTERNAL_ERROR を返し、本文に SQL を含めない", async () => {
    query.mockRejectedValueOnce(new Error("SELECT * FROM books -- 内部情報"));

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(res.body)).not.toContain("SELECT");
  });
});

describe("GET /api/books/:id", () => {
  it("販売中の書籍の詳細を description 付きで返す", async () => {
    query.mockResolvedValueOnce([[ROW_1]]);

    const res = await request(app).get("/api/books/1");

    expect(res.status).toBe(200);
    expect(res.body.book.description).toBe("猫の視点から描いた長編小説。");

    // プレースホルダを使用していること（tech-stack.md §8）
    expect(query.mock.calls[0][1]).toEqual([1]);
  });

  it("販売停止・不存在は 404 BOOK_NOT_FOUND を返す", async () => {
    // 販売停止の書籍は WHERE is_available = TRUE により0件になる
    query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/books/12");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("BOOK_NOT_FOUND");
  });

  it("id が数値でない場合も 404 を返し、DB へ問い合わせない", async () => {
    const res = await request(app).get("/api/books/abc");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("BOOK_NOT_FOUND");
    expect(query).not.toHaveBeenCalled();
  });

  it("id が 0 以下の場合も 404 を返す", async () => {
    const res = await request(app).get("/api/books/0");

    expect(res.status).toBe(404);
    expect(query).not.toHaveBeenCalled();
  });
});
