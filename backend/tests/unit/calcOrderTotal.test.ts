/**
 * calcOrderTotal の単体テスト（T045）。
 *
 * 検証対象:
 * - 小計 = 単価 × 数量、合計 = 小計の総和（SC-003）
 * - スナップショット（注文時点の書名・単価）が作られること（FR-024）
 * - クライアント送信値ではなく books の価格を使うこと
 */
import { calcOrderTotal } from "../../src/domain/calcOrderTotal";

const BOOKS = [
  { id: 1, title: "吾輩は猫である", price: 880 },
  { id: 2, title: "銀河鉄道の夜", price: 660 },
  { id: 3, title: "こころ", price: 770 },
];

describe("calcOrderTotal", () => {
  it("単一明細の小計は 単価 × 数量", () => {
    const result = calcOrderTotal(BOOKS, [{ bookId: 1, quantity: 2 }]);

    expect(result.items).toEqual([
      { title: "吾輩は猫である", unitPrice: 880, quantity: 2, subtotal: 1760 },
    ]);
    expect(result.totalAmount).toBe(1760);
  });

  it("複数明細の合計は小計の総和", () => {
    const result = calcOrderTotal(BOOKS, [
      { bookId: 1, quantity: 2 }, // 1760
      { bookId: 2, quantity: 1 }, //  660
      { bookId: 3, quantity: 3 }, // 2310
    ]);

    expect(result.totalAmount).toBe(4730);
    expect(result.totalAmount).toBe(
      result.items.reduce((sum, i) => sum + i.subtotal, 0),
    );
  });

  it("注文時点の書名と単価をスナップショットとして持つ", () => {
    const result = calcOrderTotal(BOOKS, [{ bookId: 2, quantity: 1 }]);

    expect(result.items[0].title).toBe("銀河鉄道の夜");
    expect(result.items[0].unitPrice).toBe(660);
  });

  it("books の価格が変わると算出結果も変わる（参照元は books のみ）", () => {
    const updated = [{ id: 1, title: "吾輩は猫である", price: 1000 }];
    const result = calcOrderTotal(updated, [{ bookId: 1, quantity: 2 }]);

    expect(result.items[0].unitPrice).toBe(1000);
    expect(result.totalAmount).toBe(2000);
  });

  it("明細の並び順を維持する", () => {
    const result = calcOrderTotal(BOOKS, [
      { bookId: 3, quantity: 1 },
      { bookId: 1, quantity: 1 },
    ]);

    expect(result.items.map((i) => i.title)).toEqual([
      "こころ",
      "吾輩は猫である",
    ]);
  });

  it("大きな数量でも整数演算どおりに算出する", () => {
    const result = calcOrderTotal(BOOKS, [{ bookId: 1, quantity: 10000 }]);

    expect(result.totalAmount).toBe(8_800_000);
    expect(Number.isInteger(result.totalAmount)).toBe(true);
  });

  it("books にない書籍が渡されたら例外を投げる（実装不整合の検出）", () => {
    expect(() => calcOrderTotal(BOOKS, [{ bookId: 99, quantity: 1 }])).toThrow(
      /bookId=99/,
    );
  });

  it("明細0件なら合計0", () => {
    const result = calcOrderTotal(BOOKS, []);

    expect(result.items).toEqual([]);
    expect(result.totalAmount).toBe(0);
  });
});
