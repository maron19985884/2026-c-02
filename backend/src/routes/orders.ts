import { Router } from 'express';
import { createOrder, getOrderById_controller } from '../controllers/ordersController';

const router = Router();

// POST /api/orders - 注文を作成する
router.post('/', createOrder);

// GET /api/orders/:id - 指定IDの注文詳細を取得する
router.get('/:id', getOrderById_controller);

export default router;
