import { Router } from "express";
import { BookNotFoundError, createOrder, getOrderByNumber } from "../services/orderService";
import type { CreateOrderRequest } from "../types/order";

const ordersRouter = Router();

function isValidRequestBody(body: unknown): body is CreateOrderRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { customerName, customerAddress, customerEmail, items } = body as Record<string, unknown>;

  if (
    typeof customerName !== "string" ||
    customerName.trim() === "" ||
    typeof customerAddress !== "string" ||
    customerAddress.trim() === "" ||
    typeof customerEmail !== "string" ||
    customerEmail.trim() === ""
  ) {
    return false;
  }

  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const { bookId, quantity } = item as Record<string, unknown>;
    return typeof bookId === "number" && typeof quantity === "number" && quantity >= 1;
  });
}

ordersRouter.post("/", async (req, res) => {
  if (!isValidRequestBody(req.body)) {
    res.status(400).json({ error: "Invalid order request" });
    return;
  }

  try {
    const result = await createOrder(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof BookNotFoundError) {
      res.status(400).json({ error: "Invalid order request" });
      return;
    }
    console.error("Failed to create order", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

ordersRouter.get("/:orderNumber", async (req, res) => {
  try {
    const order = await getOrderByNumber(req.params.orderNumber);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Failed to fetch order", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default ordersRouter;
