import { validateOrderRequest } from "../../src/domain/orderValidation";
import type { BookRow } from "../../src/repositories/bookRepository";

const book = (id: number, overrides: Partial<BookRow> = {}): BookRow => ({
  id,
  title: `Book ${id}`,
  author: "Author",
  price: 500,
  cover_image_url: "/images/books/placeholder.svg",
  description: "",
  status: "selling",
  ...overrides,
});

const validBody = {
  customer: { name: "山田 太郎", address: "東京都千代田区1-1-1", email: "taro@example.com" },
  items: [{ bookId: 1, quantity: 2 }],
};

describe("orderValidation.validateOrderRequest", () => {
  it("妥当なリクエストは fields が空で normalized を返す", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(validBody, found);
    expect(result.fields).toEqual({});
    expect(result.normalized?.items).toEqual([{ bookId: 1, quantity: 2 }]);
  });

  it("氏名が未入力なら fields.name", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      { ...validBody, customer: { ...validBody.customer, name: "  " } },
      found,
    );
    expect(result.fields.name).toBeDefined();
    expect(result.normalized).toBeUndefined();
  });

  it("メールアドレスに @ が無ければ fields.email", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      { ...validBody, customer: { ...validBody.customer, email: "invalid-email" } },
      found,
    );
    expect(result.fields.email).toBeDefined();
  });

  it("items が空配列なら fields.items = カートが空です", () => {
    const result = validateOrderRequest({ ...validBody, items: [] }, new Map());
    expect(result.fields.items).toBe("カートが空です");
  });

  it("存在しない bookId は fields.items", () => {
    const result = validateOrderRequest(validBody, new Map());
    expect(result.fields.items).toBeDefined();
  });

  it("unlisted の bookId は fields.items（found に含まれない前提）", () => {
    // 呼び出し元が findSellingByIds で status='selling' のみ取得するため、
    // unlisted は found に含まれない → 上と同じ経路で弾かれることを確認
    const found = new Map<number, BookRow>(); // unlisted は selling クエリで見つからない
    const result = validateOrderRequest(validBody, found);
    expect(result.fields.items).toBeDefined();
  });

  it("quantity が 0 は fields.items", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      { ...validBody, items: [{ bookId: 1, quantity: 0 }] },
      found,
    );
    expect(result.fields.items).toBeDefined();
  });

  it("quantity が 100 は fields.items", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      { ...validBody, items: [{ bookId: 1, quantity: 100 }] },
      found,
    );
    expect(result.fields.items).toBeDefined();
  });

  it("quantity が非整数(1.5)は fields.items", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      { ...validBody, items: [{ bookId: 1, quantity: 1.5 }] },
      found,
    );
    expect(result.fields.items).toBeDefined();
  });

  it("金額フィールド（unitPrice/totalAmount）が混入していても無視する", () => {
    const found = new Map([[1, book(1)]]);
    const result = validateOrderRequest(
      {
        ...validBody,
        items: [{ bookId: 1, quantity: 2, unitPrice: 1, totalAmount: 999999 }],
      },
      found,
    );
    expect(result.fields).toEqual({});
    expect(result.normalized?.items[0].quantity).toBe(2);
  });
});
