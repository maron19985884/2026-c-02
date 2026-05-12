import { Request, Response } from 'express';
import { findAllBooks, findBookById } from '../models/bookModel';
import { ApiResponse, Book } from '../types';

export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const books = await findAllBooks();
    const body: ApiResponse<Book[]> = { data: books, error: null, message: 'OK' };
    res.json(body);
  } catch (err) {
    const body: ApiResponse<null> = { data: null, error: String(err), message: 'Internal server error' };
    res.status(500).json(body);
  }
}

export async function getBook(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const body: ApiResponse<null> = { data: null, error: 'Invalid id', message: 'Bad request' };
      res.status(400).json(body);
      return;
    }
    const book = await findBookById(id);
    if (!book) {
      const body: ApiResponse<null> = { data: null, error: 'Not found', message: 'Book not found' };
      res.status(404).json(body);
      return;
    }
    const body: ApiResponse<Book> = { data: book, error: null, message: 'OK' };
    res.json(body);
  } catch (err) {
    const body: ApiResponse<null> = { data: null, error: String(err), message: 'Internal server error' };
    res.status(500).json(body);
  }
}
