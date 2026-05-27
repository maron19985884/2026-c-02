import { Router } from 'express';
import { create } from '../controllers/ordersController';

const router = Router();

router.post('/', create);

export default router;
