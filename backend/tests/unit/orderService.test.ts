import pool from "../../src/db/pool";
import { BookNotFoundError, createOrder, getOrderByNumber } from "../../src/services/orderService";
import type { CreateOrderRequest } from "../../src/types/order";

jest.mock("../../src/db/pool", () => ({
  __esModule: true,
  default: { getConnection: jest.fn(), query: jest.fn() },
}));

jest.mock("../../src/lib/generateOrderNumber", () => ({
  generateOrderNumber: jest.fn(() => "01J8Z3K9N4Q7R2XABCD5EFGHJK"),
}));

const mockedGetConnection = pool.getConnection as jest.Mock;

function buildMockConnection() {
  return {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  };
}

const request: CreateOrderRequest = {
  customerName: "山田花子",
  customerAddress: "東京都千代田区1-1-1",
  customerEmail: "hanako@example.com",
  items: [
    { bookId: 1, quantity: 2 },
    { bookId: 3, quantity: 1 },
  ],
};

describe("orderService.createOrder", () => {
  afterEach(() => {
    mockedGetConnection.mockReset();
  });

  it("computes the total from the current book prices and persists the order within a transaction", async () => {
    const connection = buildMockConnection();
    mockedGetConnection.mockResolvedValueOnce(connection);
    connection.query
      .mockResolvedValueOnce([[{ id: 1, title: "Book A", price: 1000 }]])
      .mockResolvedValueOnce([[{ id: 3, title: "Book C", price: 600 }]])
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const result = await createOrder(request);

    expect(result).toEqual({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK", totalAmount: 2600 });
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  it("ignores any client-submitted price and uses the value from the books table", async () => {
    const connection = buildMockConnection();
    mockedGetConnection.mockResolvedValueOnce(connection);
    connection.query
      .mockResolvedValueOnce([[{ id: 1, title: "Book A", price: 1000 }]])
      .mockResolvedValueOnce([[{ id: 3, title: "Book C", price: 600 }]])
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const result = await createOrder(request);

    expect(result.totalAmount).toBe(1000 * 2 + 600 * 1);
  });

  it("throws BookNotFoundError and rolls back when a bookId does not exist", async () => {
    const connection = buildMockConnection();
    mockedGetConnection.mockResolvedValueOnce(connection);
    connection.query.mockResolvedValueOnce([[]]);

    await expect(createOrder(request)).rejects.toThrow(BookNotFoundError);
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });
});

describe("orderService.getOrderByNumber", () => {
  const mockedQuery = pool.query as jest.Mock;

  afterEach(() => {
    mockedQuery.mockReset();
  });

  it("returns the order when the order number exists", async () => {
    mockedQuery.mockResolvedValueOnce([[{ order_number: "01J8Z3K9N4Q7R2XABCD5EFGHJK" }]]);

    const result = await getOrderByNumber("01J8Z3K9N4Q7R2XABCD5EFGHJK");

    expect(result).toEqual({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK" });
    expect(mockedQuery).toHaveBeenCalledWith(
      "SELECT order_number FROM orders WHERE order_number = ?",
      ["01J8Z3K9N4Q7R2XABCD5EFGHJK"]
    );
  });

  it("returns null when the order number does not exist", async () => {
    mockedQuery.mockResolvedValueOnce([[]]);

    const result = await getOrderByNumber("00000000000000000000000000");

    expect(result).toBeNull();
  });
});
