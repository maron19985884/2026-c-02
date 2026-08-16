import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const createOrderMock = vi.fn();

vi.mock("../src/repositories/orderRepository", async () => {
  const actual = await vi.importActual<typeof import("../src/repositories/orderRepository")>(
    "../src/repositories/orderRepository"
  );
  return {
    ...actual,
    createOrder: (...args: unknown[]) => createOrderMock(...args),
  };
});

const { UnavailableItemsError } = await import("../src/repositories/orderRepository");
const { default: app } = await import("../src/index");

const validBody = {
  customerName: "山田太郎",
  customerAddress: "東京都千代田区1-1-1",
  customerEmail: "taro@example.com",
  items: [{ bookId: 1, quantity: 2 }],
};

describe("POST /api/orders", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
  });

  it("returns 201 with the created order on success", async () => {
    createOrderMock.mockResolvedValue({
      orderNumber: "ORD-000001",
      totalAmount: 2000,
      items: [{ bookId: 1, title: "Book A", price: 1000, quantity: 2, subtotal: 2000 }],
    });

    const res = await request(app).post("/api/orders").send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      orderNumber: "ORD-000001",
      totalAmount: 2000,
      items: [{ bookId: 1, title: "Book A", price: 1000, quantity: 2, subtotal: 2000 }],
    });
    expect(createOrderMock).toHaveBeenCalledWith(validBody);
  });

  it("returns 400 validation_error when customerName is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, customerName: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
    expect(res.body.details).toContain("customerName is required");
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("returns 400 validation_error when customerAddress is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, customerAddress: "" });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("customerAddress is required");
  });

  it("returns 400 validation_error when customerEmail format is invalid", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, customerEmail: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
    expect(res.body.details).toContain("customerEmail format is invalid");
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("returns 400 validation_error when items is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, items: [] });

    expect(res.status).toBe(400);
    expect(res.body.details).toContain("items must not be empty");
  });

  it("returns 400 unavailable_items when the repository throws UnavailableItemsError", async () => {
    createOrderMock.mockRejectedValue(new UnavailableItemsError([3, 7]));

    const res = await request(app).post("/api/orders").send(validBody);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "unavailable_items", bookIds: [3, 7] });
  });

  it("returns 500 without leaking internal error details on unexpected errors", async () => {
    createOrderMock.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).post("/api/orders").send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal_server_error" });
  });
});
