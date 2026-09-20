/**
 * 注文作成の REST API。
 *
 * 詳細設計書 DETAIL-004 §2.7 / contracts/orders-api.md に対応。
 *
 * HTTP 境界の責務のみを担い、検証は domain、トランザクションは services に委ねる。
 * 応答に `orders.id`（内部 ID）を含めない（FR-029b）。
 */
import { Router } from "express";
import { validateOrderRequest } from "../domain/validateOrderRequest";
import { BooksUnavailableError, createOrder } from "../services/orderService";
import { HttpError, type CustomerInput, type OrderItemInput } from "../types";

export const ordersRouter = Router();

ordersRouter.post("/", async (req, res, next) => {
  try {
    const result = validateOrderRequest(req.body ?? {});
    if (!result.valid) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "入力内容に誤りがあります",
        { fields: result.fields },
      );
    }

    const customer = req.body.customer as CustomerInput;
    const items = (req.body.items as OrderItemInput[]).map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
    }));

    const order = await createOrder(customer, items);
    res.status(201).json({ order });
  } catch (err) {
    if (err instanceof BooksUnavailableError) {
      next(
        new HttpError(409, "BOOKS_UNAVAILABLE", err.message, {
          unavailableBookIds: err.unavailableBookIds,
        }),
      );
      return;
    }
    next(err);
  }
});
