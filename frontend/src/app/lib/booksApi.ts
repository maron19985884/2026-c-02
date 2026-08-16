import { fetchJson } from "./apiClient";

export type BookSummary = {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string | null;
};

export type Book = BookSummary & {
  description: string;
};

export async function listBooks(): Promise<BookSummary[]> {
  const data = await fetchJson<{ books: BookSummary[] }>("/api/books");
  return data?.books ?? [];
}

export async function getBook(id: number): Promise<Book | null> {
  return fetchJson<Book>(`/api/books/${id}`);
}
