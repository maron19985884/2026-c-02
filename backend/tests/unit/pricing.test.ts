import { lineSubtotal, orderTotal } from "../../src/domain/pricing";

describe("pricing.lineSubtotal", () => {
  it("単価 × 数量を返す", () => {
    expect(lineSubtotal(780, 2)).toBe(1560);
  });

  it("数量0でも0を返す（呼び出し元で1未満は弾く想定だが純関数としては許容）", () => {
    expect(lineSubtotal(780, 0)).toBe(0);
  });

  it("非整数の単価を渡すと例外を投げる", () => {
    expect(() => lineSubtotal(780.5, 1)).toThrow(TypeError);
  });

  it("負の数量を渡すと例外を投げる", () => {
    expect(() => lineSubtotal(780, -1)).toThrow(TypeError);
  });
});

describe("pricing.orderTotal", () => {
  it("複数明細の小計の総和を返す", () => {
    const total = orderTotal([
      { unitPrice: 780, quantity: 2 },
      { unitPrice: 690, quantity: 1 },
    ]);
    expect(total).toBe(2250);
  });

  it("空配列なら0", () => {
    expect(orderTotal([])).toBe(0);
  });

  it("送料等を加算しない（単純合算であること）", () => {
    const total = orderTotal([{ unitPrice: 100, quantity: 3 }]);
    expect(total).toBe(300);
  });
});
