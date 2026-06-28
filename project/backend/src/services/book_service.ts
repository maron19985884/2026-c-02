import { Book, findAll, findById } from '../models/book';

export async function getBooks(): Promise<Book[]> {
  return findAll();
}

export async function getBook(id: number): Promise<Book | null> {
  return findById(id);
}
