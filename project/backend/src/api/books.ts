import { Router, Request, Response } from 'express';
import { getBooks, getBook } from '../services/book_service';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const books = await getBooks();
    res.json(books);
  } catch {
    res.status(500).json({ error: '書籍一覧の取得に失敗しました' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: '無効な書籍IDです' });
    return;
  }
  try {
    const book = await getBook(id);
    if (!book) {
      res.status(404).json({ error: '書籍が見つかりません' });
      return;
    }
    res.json(book);
  } catch {
    res.status(500).json({ error: '書籍の取得に失敗しました' });
  }
});

export default router;
