/**
 * generateOrderNumber の単体テスト（T041）。
 *
 * 検証対象:
 * - 長さ26文字・Crockford Base32 の文字種（FR-023）
 * - 大量生成時に重複しないこと（SC-005）
 * - 時刻順に単調増加すること
 */
import {
  ORDER_NUMBER_LENGTH,
  generateOrderNumber,
} from "../../src/domain/generateOrderNumber";

const ALLOWED = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]+$/;

describe("generateOrderNumber", () => {
  it("26文字を返す", () => {
    expect(generateOrderNumber()).toHaveLength(26);
    expect(ORDER_NUMBER_LENGTH).toBe(26);
  });

  it("Crockford Base32 の文字種のみを使う（I・L・O・U を含まない）", () => {
    for (let i = 0; i < 200; i += 1) {
      const value = generateOrderNumber();
      expect(value).toMatch(ALLOWED);
      expect(value).not.toMatch(/[ILOU]/);
    }
  });

  it("10000件生成しても重複しない", () => {
    const generated = new Set<string>();
    for (let i = 0; i < 10000; i += 1) {
      generated.add(generateOrderNumber());
    }
    expect(generated.size).toBe(10000);
  });

  it("同一時刻でも乱数部が異なるため重複しない", () => {
    const fixed = 1_757_000_000_000;
    const a = generateOrderNumber(fixed);
    const b = generateOrderNumber(fixed);

    // 先頭10文字（時刻部）は一致する
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
    // 全体としては異なる
    expect(a).not.toBe(b);
  });

  it("時刻が進むと辞書順でも大きくなる（時刻順に並ぶ）", () => {
    const earlier = generateOrderNumber(1_757_000_000_000);
    const later = generateOrderNumber(1_757_000_001_000);

    expect(later.slice(0, 10) > earlier.slice(0, 10)).toBe(true);
  });

  it("不正な時刻を渡すと例外を投げる", () => {
    expect(() => generateOrderNumber(-1)).toThrow();
    expect(() => generateOrderNumber(1.5)).toThrow();
    expect(() => generateOrderNumber(Number.NaN)).toThrow();
  });
});
