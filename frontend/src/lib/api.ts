import type { Book, Order, CreateOrderPayload } from '@/types';

// Server components run inside the Docker container and must use the internal
// network URL (BACKEND_URL). Browser clients use the publicly exposed URL
// (NEXT_PUBLIC_API_URL). typeof window detects which environment is active.
const BASE_URL = (() => {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
})();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: unknown };
      if (typeof body.error === 'string') message = body.error;
    } catch {
      // JSON parse failure: use default message
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function fetchBooks(): Promise<Book[]> {
  return request<Book[]>('/api/books', { cache: 'no-store' });
}

export async function fetchBook(id: string): Promise<Book> {
  return request<Book>(`/api/books/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
