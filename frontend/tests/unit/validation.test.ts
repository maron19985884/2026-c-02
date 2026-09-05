import { FIELD_LIMITS, hasErrors, validateOrderForm } from "@/lib/validation";

const valid = {
  name: "山田 太郎",
  address: "東京都千代田区1-1-1",
  email: "taro@example.com",
};

describe("validateOrderForm", () => {
  it("3項目とも妥当ならエラーなし", () => {
    const errors = validateOrderForm(valid);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("氏名が空白のみなら name エラー", () => {
    expect(validateOrderForm({ ...valid, name: "   " }).name).toBeDefined();
  });

  it("住所が未入力なら address エラー", () => {
    expect(validateOrderForm({ ...valid, address: "" }).address).toBeDefined();
  });

  it("メールに @ が無ければ email エラー", () => {
    expect(validateOrderForm({ ...valid, email: "taro.example.com" }).email).toBeDefined();
  });

  it("メールにドメインの . が無ければ email エラー", () => {
    expect(validateOrderForm({ ...valid, email: "taro@example" }).email).toBeDefined();
  });

  it(`氏名が${FIELD_LIMITS.name}文字超なら name エラー`, () => {
    expect(validateOrderForm({ ...valid, name: "あ".repeat(FIELD_LIMITS.name + 1) }).name).toBeDefined();
  });

  it(`氏名が${FIELD_LIMITS.name}文字ちょうどは許容`, () => {
    expect(validateOrderForm({ ...valid, name: "あ".repeat(FIELD_LIMITS.name) }).name).toBeUndefined();
  });

  it("複数項目が不正なら複数のエラーを返す", () => {
    const errors = validateOrderForm({ name: "", address: "", email: "" });
    expect(Object.keys(errors).sort()).toEqual(["address", "email", "name"]);
    expect(hasErrors(errors)).toBe(true);
  });
});
