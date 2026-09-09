import type { Book, BookListItem } from "@/types/book";

// page.tsx はサーバーコンポーネントとしてコンテナ内部で fetch を実行するため、
// ブラウザ用の NEXT_PUBLIC_* ではなく Docker ネットワーク内のサービス名で解決する
const API_BASE_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export async function fetchBooks(): Promise<BookListItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/books`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch books: ${res.status}`);
  }

  return res.json();
}

export async function fetchBookById(id: string): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/api/books/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch book ${id}: ${res.status}`);
  }

  return res.json();
}
