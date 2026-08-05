import { Router } from 'express';
import { BookService } from '../services/bookService';

export function createBooksRouter(bookService: BookService): Router {
  const router = Router();

  router.get('/books', (_req, res) => {
    res.json(bookService.listBooks());
  });

  router.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = bookService.getBookById(id);
    if (!book) {
      res.status(404).json({ error: 'BOOK_NOT_FOUND' });
      return;
    }
    res.json(book);
  });

  return router;
}
