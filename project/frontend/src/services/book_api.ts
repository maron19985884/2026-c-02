import { Book } from '../types';

const API_BASE = '/api';

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE}/books`);
  if (!res.ok) throw new Error('書籍一覧の取得に失敗しました');
  return res.json();
}

export async function fetchBook(id: number): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/${id}`);
  if (!res.ok) throw new Error('書籍の取得に失敗しました');
  return res.json();
}
