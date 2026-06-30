import { Router, Request, Response } from "express";
import { createOrder } from "../services/orderService";
import { CreateOrderRequest } from "../types/api";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as Partial<CreateOrderRequest>;

  if (!body.customerName || body.customerName.trim() === "") {
    res.status(400).json({ error: "customerName is required" });
    return;
  }
  if (!body.address || body.address.trim() === "") {
    res.status(400).json({ error: "address is required" });
    return;
  }
  if (!body.email || !EMAIL_RE.test(body.email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: "items must not be empty" });
    return;
  }
  if (typeof body.totalAmount !== "number" || body.totalAmount <= 0) {
    res.status(400).json({ error: "totalAmount must be a positive number" });
    return;
  }

  try {
    const result = await createOrder(body as CreateOrderRequest);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
