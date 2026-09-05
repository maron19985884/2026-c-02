import { subtotal, total } from "@/lib/cartTotal";

describe("cartTotal.subtotal", () => {
  it("単価 × 数量を返す", () => {
    expect(subtotal(780, 2)).toBe(1560);
  });
});

describe("cartTotal.total", () => {
  it("複数明細の小計の総和を返す（送料等は加算しない／SC-006）", () => {
    expect(
      total([
        { unitPrice: 780, quantity: 2 },
        { unitPrice: 690, quantity: 1 },
      ]),
    ).toBe(2250);
  });

  it("空配列なら0", () => {
    expect(total([])).toBe(0);
  });
});
