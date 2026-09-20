/**
 * validateOrderRequest の単体テスト（T043）。
 *
 * 検証対象（SC-004）:
 * - 各項目の未入力・空白のみ・最大長超過
 * - メール形式不正
 * - 明細0件・数量不正・bookId 重複
 */
import { validateOrderRequest } from "../../src/domain/validateOrderRequest";

const VALID = {
  customer: {
    name: "小林 景大",
    address: "東京都千代田区丸の内1-1-1",
    email: "kobayashi@example.com",
  },
  items: [{ bookId: 1, quantity: 2 }],
};

describe("正常系", () => {
  it("妥当な入力は valid になる", () => {
    const result = validateOrderRequest(VALID);
    expect(result.valid).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("数量に上限を設けない", () => {
    const result = validateOrderRequest({
      ...VALID,
      items: [{ bookId: 1, quantity: 999999 }],
    });
    expect(result.valid).toBe(true);
  });
});

describe("顧客情報", () => {
  it.each(["name", "address", "email"] as const)(
    "%s が未入力なら REQUIRED",
    (field) => {
      const result = validateOrderRequest({
        ...VALID,
        customer: { ...VALID.customer, [field]: "" },
      });
      expect(result.valid).toBe(false);
      expect(result.fields[field]).toBe("REQUIRED");
    },
  );

  it.each(["name", "address", "email"] as const)(
    "%s が空白のみなら REQUIRED",
    (field) => {
      const result = validateOrderRequest({
        ...VALID,
        customer: { ...VALID.customer, [field]: "   　 " },
      });
      expect(result.fields[field]).toBe("REQUIRED");
    },
  );

  it.each(["name", "address", "email"] as const)(
    "%s が未定義なら REQUIRED",
    (field) => {
      const customer = { ...VALID.customer } as Record<string, unknown>;
      delete customer[field];
      const result = validateOrderRequest({ ...VALID, customer });
      expect(result.fields[field]).toBe("REQUIRED");
    },
  );

  it("customer 自体がなければ3項目すべて REQUIRED", () => {
    const result = validateOrderRequest({ items: VALID.items });
    expect(result.fields.name).toBe("REQUIRED");
    expect(result.fields.address).toBe("REQUIRED");
    expect(result.fields.email).toBe("REQUIRED");
  });

  it("氏名が100文字を超えると TOO_LONG", () => {
    const result = validateOrderRequest({
      ...VALID,
      customer: { ...VALID.customer, name: "あ".repeat(101) },
    });
    expect(result.fields.name).toBe("TOO_LONG");
  });

  it("氏名が100文字ちょうどなら通る", () => {
    const result = validateOrderRequest({
      ...VALID,
      customer: { ...VALID.customer, name: "あ".repeat(100) },
    });
    expect(result.valid).toBe(true);
  });

  it("住所が255文字を超えると TOO_LONG", () => {
    const result = validateOrderRequest({
      ...VALID,
      customer: { ...VALID.customer, address: "あ".repeat(256) },
    });
    expect(result.fields.address).toBe("TOO_LONG");
  });

  it.each([
    "example.com",
    "user@",
    "@example.com",
    "user@example",
    "user name@example.com",
    "user@@example.com",
  ])("メール %s は INVALID_FORMAT", (email) => {
    const result = validateOrderRequest({
      ...VALID,
      customer: { ...VALID.customer, email },
    });
    expect(result.fields.email).toBe("INVALID_FORMAT");
  });

  it.each([
    "user@example.com",
    "user.name+tag@example.co.jp",
    "u@a.io",
  ])("メール %s は妥当", (email) => {
    const result = validateOrderRequest({
      ...VALID,
      customer: { ...VALID.customer, email },
    });
    expect(result.valid).toBe(true);
  });
});

describe("明細", () => {
  it("items が空配列なら EMPTY", () => {
    const result = validateOrderRequest({ ...VALID, items: [] });
    expect(result.fields.items).toBe("EMPTY");
  });

  it("items が未定義なら EMPTY", () => {
    const result = validateOrderRequest({ customer: VALID.customer });
    expect(result.fields.items).toBe("EMPTY");
  });

  it.each([0, -1, 1.5, "2", null])(
    "数量 %p は INVALID_QUANTITY",
    (quantity) => {
      const result = validateOrderRequest({
        ...VALID,
        items: [{ bookId: 1, quantity }],
      });
      expect(result.fields.items).toBe("INVALID_QUANTITY");
    },
  );

  it.each([0, -1, "1", null])("bookId %p は INVALID_QUANTITY", (bookId) => {
    const result = validateOrderRequest({
      ...VALID,
      items: [{ bookId, quantity: 1 }],
    });
    expect(result.fields.items).toBe("INVALID_QUANTITY");
  });

  it("同一 bookId が複数あれば DUPLICATE_BOOK", () => {
    const result = validateOrderRequest({
      ...VALID,
      items: [
        { bookId: 1, quantity: 1 },
        { bookId: 1, quantity: 2 },
      ],
    });
    expect(result.fields.items).toBe("DUPLICATE_BOOK");
  });

  it("異なる bookId なら通る", () => {
    const result = validateOrderRequest({
      ...VALID,
      items: [
        { bookId: 1, quantity: 1 },
        { bookId: 2, quantity: 2 },
      ],
    });
    expect(result.valid).toBe(true);
  });
});

describe("金額の改ざん防止", () => {
  it("リクエストに金額が含まれていても検証結果に影響しない", () => {
    const result = validateOrderRequest({
      ...VALID,
      items: [{ bookId: 1, quantity: 1, unitPrice: 1, subtotal: 1 }],
      totalAmount: 1,
    } as Parameters<typeof validateOrderRequest>[0]);

    expect(result.valid).toBe(true);
  });
});
