import { generateOrderNumber } from "../../src/lib/generateOrderNumber";

describe("generateOrderNumber", () => {
  it("returns a 26-character Crockford Base32 string", () => {
    const orderNumber = generateOrderNumber();

    expect(orderNumber).toHaveLength(26);
    expect(orderNumber).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it("returns a different value on each call", () => {
    const first = generateOrderNumber();
    const second = generateOrderNumber();

    expect(first).not.toBe(second);
  });
});
