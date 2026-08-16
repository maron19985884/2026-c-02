import { Router, Request, Response } from "express";
import * as orderRepository from "../repositories/orderRepository";
import { UnavailableItemsError } from "../repositories/orderRepository";
import type { OrderRequest } from "../types/order";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ordersRouter = Router();

function validate(body: Partial<OrderRequest>): string[] {
  const details: string[] = [];

  if (!body.customerName || body.customerName.trim() === "") {
    details.push("customerName is required");
  }
  if (!body.customerAddress || body.customerAddress.trim() === "") {
    details.push("customerAddress is required");
  }
  if (!body.customerEmail || body.customerEmail.trim() === "") {
    details.push("customerEmail is required");
  } else if (!EMAIL_PATTERN.test(body.customerEmail)) {
    details.push("customerEmail format is invalid");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    details.push("items must not be empty");
  } else if (
    body.items.some(
      (item) => !Number.isInteger(item?.bookId) || !Number.isInteger(item?.quantity) || item.quantity < 1
    )
  ) {
    details.push("items must have an integer bookId and a quantity of 1 or more");
  }

  return details;
}

ordersRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as Partial<OrderRequest>;
  const details = validate(body);

  if (details.length > 0) {
    res.status(400).json({ error: "validation_error", details });
    return;
  }

  try {
    const result = await orderRepository.createOrder(body as OrderRequest);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof UnavailableItemsError) {
      res.status(400).json({ error: "unavailable_items", bookIds: error.bookIds });
      return;
    }
    console.error("Failed to create order", error);
    res.status(500).json({ error: "internal_server_error" });
  }
});

export default ordersRouter;
