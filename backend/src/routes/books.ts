import { Router } from 'express';
import { getAll, getById } from '../controllers/booksController';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

export default router;
