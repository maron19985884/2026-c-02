/**
 * calcCartTotal の単体テスト（T034）。
 *
 * 検証対象:
 * - 小計 = 単価 × 数量、合計 = 小計の総和（FR-010 / FR-013 / SC-003）
 * - 0件の扱い
 * - 販売停止・削除された書籍の検出（FR-016b）
 * - 大きな数量でも整数演算どおりであること（FR-011b）
 */
import { calcCartTotal } from "@/lib/calcCartTotal";
import type { BookSummary } from "@/lib/apiClient";

const BOOKS: BookSummary[] = [
  { id: 1, title: "吾輩は猫である", author: "夏目漱石", price: 880, coverImageUrl: null },
  { id: 2, title: "銀河鉄道の夜", author: "宮沢賢治", price: 660, coverImageUrl: null },
  { id: 3, title: "こころ", author: "夏目漱石", price: 770, coverImageUrl: null },
];

describe("calcCartTotal", () => {
  it("カートが0件なら合計は0", () => {
    const result = calcCartTotal([], BOOKS);

    expect(result.lines).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.unavailableBookIds).toEqual([]);
  });

  it("単一明細の小計は 単価 × 数量", () => {
    const result = calcCartTotal([{ bookId: 1, quantity: 2 }], BOOKS);

    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].subtotal).toBe(1760);
    expect(result.total).toBe(1760);
  });

  it("複数明細の合計は小計の総和", () => {
    const result = calcCartTotal(
      [
        { bookId: 1, quantity: 2 }, // 880 * 2 = 1760
        { bookId: 2, quantity: 1 }, // 660 * 1 =  660
        { bookId: 3, quantity: 3 }, // 770 * 3 = 2310
      ],
      BOOKS,
    );

    expect(result.lines.map((l) => l.subtotal)).toEqual([1760, 660, 2310]);
    expect(result.total).toBe(4730);
    // 合計が小計の総和と一致すること（SC-003）
    expect(result.total).toBe(
      result.lines.reduce((sum, l) => sum + l.subtotal, 0),
    );
  });

  it("明細には書名と単価が含まれる", () => {
    const result = calcCartTotal([{ bookId: 2, quantity: 1 }], BOOKS);

    expect(result.lines[0]).toEqual({
      bookId: 2,
      title: "銀河鉄道の夜",
      unitPrice: 660,
      quantity: 1,
      subtotal: 660,
    });
  });

  it("カートの並び順を維持する", () => {
    const result = calcCartTotal(
      [
        { bookId: 3, quantity: 1 },
        { bookId: 1, quantity: 1 },
      ],
      BOOKS,
    );

    expect(result.lines.map((l) => l.bookId)).toEqual([3, 1]);
  });

  it("books に見つからない書籍は合計に含めず ID を返す", () => {
    const result = calcCartTotal(
      [
        { bookId: 1, quantity: 1 },
        { bookId: 99, quantity: 5 },
      ],
      BOOKS,
    );

    expect(result.lines).toHaveLength(1);
    expect(result.total).toBe(880);
    expect(result.unavailableBookIds).toEqual([99]);
  });

  it("すべて購入できない場合は合計0と全IDを返す", () => {
    const result = calcCartTotal(
      [
        { bookId: 98, quantity: 1 },
        { bookId: 99, quantity: 2 },
      ],
      BOOKS,
    );

    expect(result.lines).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.unavailableBookIds).toEqual([98, 99]);
  });

  it("大きな数量でも整数演算どおりに算出する（上限を設けない）", () => {
    const result = calcCartTotal([{ bookId: 1, quantity: 10000 }], BOOKS);

    expect(result.total).toBe(8_800_000);
    expect(Number.isInteger(result.total)).toBe(true);
  });

  it("送料・手数料・割引を含めない（合計は小計の総和のみ）", () => {
    const result = calcCartTotal(
      [
        { bookId: 1, quantity: 1 },
        { bookId: 2, quantity: 1 },
      ],
      BOOKS,
    );

    expect(result.total).toBe(880 + 660);
  });
});
