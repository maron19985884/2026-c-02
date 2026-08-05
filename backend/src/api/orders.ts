import { Router } from 'express';
import { OrderService, BookNotFoundError } from '../services/orderService';
import { validateOrderInput, hasValidationErrors } from '../services/orderValidation';
import { CreateOrderInput } from '../models/order';

export function createOrdersRouter(orderService: OrderService): Router {
  const router = Router();

  router.post('/orders', (req, res) => {
    const body = req.body ?? {};
    const errors = validateOrderInput(body);
    if (hasValidationErrors(errors)) {
      res.status(400).json({ error: 'VALIDATION_ERROR', fields: errors });
      return;
    }

    try {
      const order = orderService.createOrder(body as CreateOrderInput);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof BookNotFoundError) {
        res.status(404).json({ error: 'BOOK_NOT_FOUND', bookId: err.bookId });
        return;
      }
      throw err;
    }
  });

  return router;
}
