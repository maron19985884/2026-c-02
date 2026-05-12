import { Router } from 'express';
import { getProducts, getProductById_controller } from '../controllers/productsController';

const router = Router();

// GET /api/products - 全商品一覧を取得する
router.get('/', getProducts);

// GET /api/products/:id - 指定IDの商品詳細を取得する
router.get('/:id', getProductById_controller);

export default router;
