import { generateOrderNumber, ORDER_NUMBER_PATTERN } from "../../src/domain/orderNumber";

describe("orderNumber.generateOrderNumber", () => {
  it("ORD- + 26文字の Crockford Base32 という形式で返す", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(ORDER_NUMBER_PATTERN);
    expect(n.startsWith("ORD-")).toBe(true);
    expect(n.length).toBe(4 + 26);
  });

  it("I, L, O, U を含まない（Crockford Base32 の除外文字）", () => {
    const n = generateOrderNumber();
    const body = n.slice(4);
    expect(body).not.toMatch(/[ILOU]/);
  });

  it("連続生成しても一意になる（乱数部分により衝突しない）", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateOrderNumber()));
    expect(set.size).toBe(200);
  });

  it("同じ時刻でも乱数部分により毎回異なる", () => {
    const now = Date.now();
    const a = generateOrderNumber(now);
    const b = generateOrderNumber(now);
    expect(a).not.toBe(b);
  });
});
