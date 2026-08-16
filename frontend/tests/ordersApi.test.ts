import { describe, it, expect, vi, afterEach } from "vitest";
import { createOrder, ValidationError, UnavailableItemsError } from "../src/app/lib/ordersApi";

const validInput = {
  customerName: "山田太郎",
  customerAddress: "東京都千代田区1-1-1",
  customerEmail: "taro@example.com",
  items: [{ bookId: 1, quantity: 2 }],
};

describe("ordersApi.createOrder", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the OrderResult on 201", async () => {
    const orderResult = {
      orderNumber: "ORD-000001",
      totalAmount: 2000,
      items: [{ bookId: 1, title: "Book A", price: 1000, quantity: 2, subtotal: 2000 }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 201,
        json: async () => orderResult,
      })
    );

    const result = await createOrder(validInput);

    expect(result).toEqual(orderResult);
  });

  it("throws ValidationError on 400 validation_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({
          error: "validation_error",
          details: ["customerName is required"],
        }),
      })
    );

    await expect(createOrder(validInput)).rejects.toThrow(ValidationError);
  });

  it("throws UnavailableItemsError on 400 unavailable_items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ error: "unavailable_items", bookIds: [3, 7] }),
      })
    );

    await expect(createOrder(validInput)).rejects.toThrow(UnavailableItemsError);
  });

  it("throws a generic Error on 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        json: async () => ({ error: "internal_server_error" }),
      })
    );

    await expect(createOrder(validInput)).rejects.toThrow();
  });

  it("propagates network exceptions from fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(createOrder(validInput)).rejects.toThrow("network down");
  });
});
