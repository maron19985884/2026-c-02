import { ApiResponse, Book, CreateOrderRequest, Order, OrderWithItems } from '@/types';

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server Component / SSR: Docker 内部ネットワーク経由
    return process.env.INTERNAL_API_URL ?? 'http://localhost:4000';
  }
  // ブラウザ: ホストの公開ポート経由
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetchApi<Book[]>('/api/books');
  if (!res.data) throw new Error(res.error ?? 'Failed to fetch books');
  return res.data;
}

export async function getBook(id: number): Promise<Book> {
  const res = await fetchApi<Book>(`/api/books/${id}`);
  if (!res.data) throw new Error(res.error ?? 'Failed to fetch book');
  return res.data;
}

export async function postOrder(body: CreateOrderRequest): Promise<Order> {
  const res = await fetchApi<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.data) throw new Error(res.error ?? 'Failed to create order');
  return res.data;
}

export async function getOrder(id: number): Promise<OrderWithItems> {
  const res = await fetchApi<OrderWithItems>(`/api/orders/${id}`);
  if (!res.data) throw new Error(res.error ?? 'Failed to fetch order');
  return res.data;
}
