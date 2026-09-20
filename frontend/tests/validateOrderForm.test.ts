/**
 * validateOrderForm の単体テスト（T052）。
 *
 * バックエンドの validateOrderRequest.test.ts と同じケースで検証し、
 * 両者の判定が一致することを担保する（SC-004）。
 */
import {
  isValidEmail,
  toFormErrors,
  validateOrderForm,
} from "@/lib/validateOrderForm";

const VALID = {
  name: "小林 景大",
  address: "東京都千代田区丸の内1-1-1",
  email: "kobayashi@example.com",
};

describe("validateOrderForm", () => {
  it("妥当な入力ならエラーなし", () => {
    expect(validateOrderForm(VALID)).toEqual({});
  });

  it.each(["name", "address", "email"] as const)(
    "%s が未入力ならエラーになる",
    (field) => {
      const errors = validateOrderForm({ ...VALID, [field]: "" });
      expect(errors[field]).toBeDefined();
    },
  );

  it.each(["name", "address", "email"] as const)(
    "%s が空白のみならエラーになる",
    (field) => {
      const errors = validateOrderForm({ ...VALID, [field]: "   　 " });
      expect(errors[field]).toBeDefined();
    },
  );

  it("未入力のエラーメッセージは項目名を含む", () => {
    const errors = validateOrderForm({ ...VALID, name: "" });
    expect(errors.name).toContain("氏名");
  });

  it("3項目すべて未入力なら3件のエラーを返す", () => {
    const errors = validateOrderForm({ name: "", address: "", email: "" });
    expect(Object.keys(errors)).toHaveLength(3);
  });

  it("氏名が100文字を超えるとエラー", () => {
    const errors = validateOrderForm({ ...VALID, name: "あ".repeat(101) });
    expect(errors.name).toContain("100文字以内");
  });

  it("氏名が100文字ちょうどなら通る", () => {
    expect(validateOrderForm({ ...VALID, name: "あ".repeat(100) })).toEqual({});
  });

  it("住所が255文字を超えるとエラー", () => {
    const errors = validateOrderForm({ ...VALID, address: "あ".repeat(256) });
    expect(errors.address).toContain("255文字以内");
  });

  it.each([
    "example.com",
    "user@",
    "@example.com",
    "user@example",
    "user name@example.com",
  ])("メール %s は形式不正", (email) => {
    const errors = validateOrderForm({ ...VALID, email });
    expect(errors.email).toContain("形式");
  });

  it.each(["user@example.com", "user.name+tag@example.co.jp", "u@a.io"])(
    "メール %s は妥当",
    (email) => {
      expect(validateOrderForm({ ...VALID, email })).toEqual({});
    },
  );

  it("前後の空白は除いて判定する", () => {
    expect(
      validateOrderForm({
        name: "  小林 景大  ",
        address: "  東京都  ",
        email: "  user@example.com  ",
      }),
    ).toEqual({});
  });
});

describe("isValidEmail", () => {
  it("バックエンドと同じ規則で判定する", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user@example")).toBe(false);
    expect(isValidEmail("user@@example.com")).toBe(false);
  });
});

describe("toFormErrors", () => {
  it("サーバの fields を画面表示用メッセージへ変換する", () => {
    const errors = toFormErrors({ name: "REQUIRED", email: "INVALID_FORMAT" });

    expect(errors.name).toContain("氏名");
    expect(errors.email).toContain("形式");
    expect(errors.address).toBeUndefined();
  });

  it("未知のコードは無視する", () => {
    expect(toFormErrors({ name: "UNKNOWN_CODE" })).toEqual({});
  });

  it("items など項目以外のキーは無視する", () => {
    expect(toFormErrors({ items: "EMPTY" })).toEqual({});
  });
});
