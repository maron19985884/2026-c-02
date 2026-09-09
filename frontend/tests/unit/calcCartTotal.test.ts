import { calcCartTotal } from "@/lib/calcCartTotal";
import type { CartItem } from "@/types/cart";

describe("calcCartTotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(calcCartTotal([])).toBe(0);
  });

  it("returns the sum of price times quantity for each item", () => {
    const items: CartItem[] = [
      { bookId: 1, title: "Book A", price: 1000, imageUrl: null, quantity: 2 },
      { bookId: 2, title: "Book B", price: 1500, imageUrl: null, quantity: 1 },
    ];

    expect(calcCartTotal(items)).toBe(3500);
  });
});
