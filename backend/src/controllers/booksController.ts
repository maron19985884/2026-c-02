import { Request, Response } from 'express';
import { readJson } from '../utils/fileStore';
import type { Book } from '../types';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await readJson<Book[]>('books.json');
    res.json(books);
  } catch {
    res.status(500).json({ error: '書籍データの読み込みに失敗しました' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await readJson<Book[]>('books.json');
    const book = books.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: '指定された書籍が見つかりません' });
      return;
    }
    res.json(book);
  } catch {
    res.status(500).json({ error: '書籍データの読み込みに失敗しました' });
  }
};
