import express from "express";
import request from "supertest";
import ordersRouter from "../../src/api/ordersRouter";
import { BookNotFoundError, createOrder, getOrderByNumber } from "../../src/services/orderService";

jest.mock("../../src/services/orderService");

const mockedCreateOrder = createOrder as jest.Mock;
const mockedGetOrderByNumber = getOrderByNumber as jest.Mock;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/orders", ordersRouter);
  return app;
}

const validBody = {
  customerName: "山田花子",
  customerAddress: "東京都千代田区1-1-1",
  customerEmail: "hanako@example.com",
  items: [{ bookId: 1, quantity: 2 }],
};

describe("POST /api/orders", () => {
  afterEach(() => {
    mockedCreateOrder.mockReset();
  });

  it("returns 201 with orderNumber and totalAmount for a valid request", async () => {
    mockedCreateOrder.mockResolvedValueOnce({
      orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK",
      totalAmount: 2000,
    });

    const res = await request(buildApp()).post("/api/orders").send(validBody);

    expect(mockedCreateOrder).toHaveBeenCalledWith(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK", totalAmount: 2000 });
  });

  it.each([
    ["customerName", { ...validBody, customerName: "" }],
    ["customerAddress", { ...validBody, customerAddress: "" }],
    ["customerEmail", { ...validBody, customerEmail: "" }],
  ])("returns 400 when %s is empty", async (_field, body) => {
    const res = await request(buildApp()).post("/api/orders").send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid order request" });
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it("returns 400 when items is an empty array", async () => {
    const res = await request(buildApp())
      .post("/api/orders")
      .send({ ...validBody, items: [] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid order request" });
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it("returns 400 when an item's quantity is less than 1", async () => {
    const res = await request(buildApp())
      .post("/api/orders")
      .send({ ...validBody, items: [{ bookId: 1, quantity: 0 }] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid order request" });
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it("returns 400 when the service reports a nonexistent bookId", async () => {
    mockedCreateOrder.mockRejectedValueOnce(new BookNotFoundError(999));

    const res = await request(buildApp()).post("/api/orders").send(validBody);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid order request" });
  });

  it("returns 500 when order creation fails unexpectedly", async () => {
    mockedCreateOrder.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(buildApp()).post("/api/orders").send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create order" });
  });
});

describe("GET /api/orders/:orderNumber", () => {
  afterEach(() => {
    mockedGetOrderByNumber.mockReset();
  });

  it("returns 200 with the order number when it exists", async () => {
    mockedGetOrderByNumber.mockResolvedValueOnce({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK" });

    const res = await request(buildApp()).get("/api/orders/01J8Z3K9N4Q7R2XABCD5EFGHJK");

    expect(mockedGetOrderByNumber).toHaveBeenCalledWith("01J8Z3K9N4Q7R2XABCD5EFGHJK");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ orderNumber: "01J8Z3K9N4Q7R2XABCD5EFGHJK" });
  });

  it("returns 404 when the order number does not exist", async () => {
    mockedGetOrderByNumber.mockResolvedValueOnce(null);

    const res = await request(buildApp()).get("/api/orders/00000000000000000000000000");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Order not found" });
  });

  it("returns 500 when the lookup fails unexpectedly", async () => {
    mockedGetOrderByNumber.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(buildApp()).get("/api/orders/01J8Z3K9N4Q7R2XABCD5EFGHJK");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch order" });
  });
});
