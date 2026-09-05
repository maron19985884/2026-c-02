import { Router } from "express";

import { notFound } from "../middleware/errorHandler";
import { createOrder, getOrder } from "../services/orderService";

export const ordersRouter = Router();

// POST /api/orders
ordersRouter.post("/", (req, res, next) => {
  createOrder(req.body)
    .then((order) => res.status(201).json(order))
    .catch(next);
});

// GET /api/orders/:orderNumber （補助照会 / SC-007）
ordersRouter.get("/:orderNumber", (req, res, next) => {
  getOrder(req.params.orderNumber)
    .then((order) => {
      if (!order) throw notFound("order not found");
      res.json(order);
    })
    .catch(next);
});
