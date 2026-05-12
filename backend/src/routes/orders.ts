import { Router } from 'express';
import { postOrder, getOrder } from '../controllers/orderController';

const router = Router();

router.post('/', postOrder);
router.get('/:id', getOrder);

export default router;
