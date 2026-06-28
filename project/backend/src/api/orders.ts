import { Router, Request, Response } from 'express';
import { createOrder } from '../services/order_service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = await createOrder(req.body);
    res.status(201).json({ order_number: orderNumber });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; errors?: object; error?: string };
    if (e.statusCode === 400) {
      res.status(400).json({ errors: e.errors });
      return;
    }
    if (e.statusCode === 422) {
      res.status(422).json({ error: e.error });
      return;
    }
    res.status(500).json({ error: '注文の確定に失敗しました。時間をおいて再度お試しください。' });
  }
});

export default router;
