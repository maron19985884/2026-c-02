const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export interface BookSummary {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}

export interface BookDetail extends BookSummary {
  description: string;
}

export interface CreateOrderRequest {
  customerName: string;
  address: string;
  email: string;
  items: { bookId: number; quantity: number }[];
}

export interface OrderItemResponse {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderResponse {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  items: OrderItemResponse[];
  totalAmount: number;
}

export interface ApiValidationError {
  error: 'VALIDATION_ERROR';
  fields: Record<string, string>;
}

export async function fetchBooks(): Promise<BookSummary[]> {
  const res = await fetch(`${API_BASE_URL}/books`);
  if (!res.ok) throw new Error('商品一覧の取得に失敗しました');
  return res.json();
}

export async function fetchBookById(id: number): Promise<BookDetail | undefined> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error('商品詳細の取得に失敗しました');
  return res.json();
}

export async function createOrder(
  input: CreateOrderRequest
): Promise<{ ok: true; data: CreateOrderResponse } | { ok: false; error: ApiValidationError }> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (res.status === 201) {
    return { ok: true, data: body as CreateOrderResponse };
  }
  return { ok: false, error: body as ApiValidationError };
}
