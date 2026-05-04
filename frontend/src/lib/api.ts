import { Book, Order, CreateOrderPayload, CreateOrderResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // 書籍一覧取得
  getBooks(): Promise<Book[]> {
    return fetchJson<Book[]>("/api/books");
  },

  // 書籍詳細取得
  getBook(id: number): Promise<Book> {
    return fetchJson<Book>(`/api/books/${id}`);
  },

  // 注文作成
  createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    return fetchJson<CreateOrderResponse>("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  // 注文詳細取得
  getOrder(id: number): Promise<Order> {
    return fetchJson<Order>(`/api/orders/${id}`);
  },
};
