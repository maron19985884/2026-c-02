import type {
  BookDetail,
  BooksListResponse,
  OrderFieldErrors,
  OrderRequest,
  OrderResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "NETWORK";

/**
 * すべての API 失敗（非2xx・ネットワーク断）をこの型に正規化する。
 * `POST /api/orders` の 400 のみ `fields` を利用し、それ以外は汎用エラー表示にする（CL-007 / D-12）。
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields?: OrderFieldErrors;

  constructor(status: number, code: ApiErrorCode, message: string, fields?: OrderFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

interface RawErrorBody {
  error?: string;
  message?: string;
  fields?: OrderFieldErrors;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch (e) {
    throw new ApiError(0, "NETWORK", e instanceof Error ? e.message : "network error");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const raw = (body ?? {}) as RawErrorBody;
    const code: ApiErrorCode =
      raw.error === "VALIDATION_ERROR" ||
      raw.error === "NOT_FOUND" ||
      raw.error === "INTERNAL_ERROR"
        ? raw.error
        : "INTERNAL_ERROR";
    throw new ApiError(res.status, code, raw.message ?? `request failed (${res.status})`, raw.fields);
  }

  return body as T;
}

export const api = {
  getBooks(page: number, pageSize?: number): Promise<BooksListResponse> {
    const q = new URLSearchParams({ page: String(page) });
    if (pageSize) q.set("pageSize", String(pageSize));
    return request<BooksListResponse>(`/api/books?${q.toString()}`);
  },

  getBook(id: number): Promise<BookDetail> {
    return request<BookDetail>(`/api/books/${id}`);
  },

  createOrder(payload: OrderRequest): Promise<OrderResponse> {
    return request<OrderResponse>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getOrder(orderNumber: string): Promise<OrderResponse> {
    return request<OrderResponse>(`/api/orders/${encodeURIComponent(orderNumber)}`);
  },
};
