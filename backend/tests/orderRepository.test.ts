import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const beginTransactionMock = vi.fn();
const commitMock = vi.fn();
const rollbackMock = vi.fn();
const releaseMock = vi.fn();
const getConnectionMock = vi.fn();

vi.mock("../src/db/pool", () => ({
  default: { getConnection: (...args: unknown[]) => getConnectionMock(...args) },
}));

const { createOrder, UnavailableItemsError } = await import("../src/repositories/orderRepository");

describe("orderRepository.createOrder", () => {
  beforeEach(() => {
    queryMock.mockReset();
    beginTransactionMock.mockReset();
    commitMock.mockReset();
    rollbackMock.mockReset();
    releaseMock.mockReset();
    getConnectionMock.mockReset();
    getConnectionMock.mockResolvedValue({
      beginTransaction: beginTransactionMock,
      commit: commitMock,
      rollback: rollbackMock,
      release: releaseMock,
      query: queryMock,
    });
  });

  it("persists the order and order items in a single transaction and returns a formatted order number", async () => {
    queryMock
      .mockResolvedValueOnce([
        [
          { id: 1, title: "Book A", price: 1000 },
          { id: 2, title: "Book B", price: 1500 },
        ],
      ])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const result = await createOrder({
      customerName: "山田太郎",
      customerAddress: "東京都千代田区1-1-1",
      customerEmail: "taro@example.com",
      items: [
        { bookId: 1, quantity: 2 },
        { bookId: 2, quantity: 1 },
      ],
    });

    expect(beginTransactionMock).toHaveBeenCalled();
    expect(commitMock).toHaveBeenCalled();
    expect(rollbackMock).not.toHaveBeenCalled();
    expect(releaseMock).toHaveBeenCalled();

    expect(result).toEqual({
      orderNumber: "ORD-000001",
      totalAmount: 3500,
      items: [
        { bookId: 1, title: "Book A", price: 1000, quantity: 2, subtotal: 2000 },
        { bookId: 2, title: "Book B", price: 1500, quantity: 1, subtotal: 1500 },
      ],
    });
  });

  it("rolls back and throws UnavailableItemsError when a book is missing or not for sale", async () => {
    queryMock.mockResolvedValueOnce([[{ id: 1, title: "Book A", price: 1000 }]]);

    await expect(
      createOrder({
        customerName: "山田太郎",
        customerAddress: "東京都千代田区1-1-1",
        customerEmail: "taro@example.com",
        items: [
          { bookId: 1, quantity: 1 },
          { bookId: 999, quantity: 1 },
        ],
      })
    ).rejects.toThrow(UnavailableItemsError);

    expect(rollbackMock).toHaveBeenCalled();
    expect(commitMock).not.toHaveBeenCalled();
    expect(releaseMock).toHaveBeenCalled();
  });

  it("rolls back and rethrows on an unexpected database error", async () => {
    queryMock.mockRejectedValueOnce(new Error("connection lost"));

    await expect(
      createOrder({
        customerName: "山田太郎",
        customerAddress: "東京都千代田区1-1-1",
        customerEmail: "taro@example.com",
        items: [{ bookId: 1, quantity: 1 }],
      })
    ).rejects.toThrow("connection lost");

    expect(rollbackMock).toHaveBeenCalled();
    expect(releaseMock).toHaveBeenCalled();
  });
});
