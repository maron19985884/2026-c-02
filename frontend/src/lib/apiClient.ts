/**
 * バックエンド API の呼び出しとエラー応答のパース。
 *
 * 詳細設計書 DETAIL-004 §2.9 / contracts/README.md に対応。
 * ベース URL は環境変数から取得し、コードへ直書きしない（tech-stack.md §8）。
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "BOOK_NOT_FOUND"
  | "BOOKS_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface BookSummary {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string | null;
}

export interface Book extends BookSummary {
  description: string;
}

export interface OrderItemSnapshot {
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResult {
  orderNumber: string;
  totalAmount: number;
  items: OrderItemSnapshot[];
}

export interface CustomerInput {
  name: string;
  address: string;
  email: string;
}

export interface OrderItemInput {
  bookId: number;
  quantity: number;
}

/** API が返したエラー、または通信自体の失敗を表す例外 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

const KNOWN_CODES: ApiErrorCode[] = [
  "VALIDATION_ERROR",
  "BOOK_NOT_FOUND",
  "BOOKS_UNAVAILABLE",
  "INTERNAL_ERROR",
];

function toApiErrorCode(value: unknown): ApiErrorCode {
  return KNOWN_CODES.includes(value as ApiErrorCode)
    ? (value as ApiErrorCode)
    : "INTERNAL_ERROR";
}

/** 応答を JSON として読み、エラーなら ApiClientError を投げる */
async function parse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // 本文が JSON でない場合は既定のメッセージにフォールバックする
  }

  throw new ApiClientError(
    response.status,
    toApiErrorCode(body.error?.code),
    body.error?.message ?? "通信に失敗しました。時間をおいて再度お試しください",
    body.error?.details,
  );
}

/** ネットワーク断などで fetch 自体が失敗した場合も ApiClientError に揃える */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...init,
    });
  } catch {
    throw new ApiClientError(
      0,
      "INTERNAL_ERROR",
      "サーバに接続できませんでした。時間をおいて再度お試しください",
    );
  }
  return parse<T>(response);
}

/** 販売中の書籍を全件取得する（FR-001） */
export async function fetchBooks(): Promise<BookSummary[]> {
  const data = await request<{ books: BookSummary[] }>("/api/books");
  return data.books;
}

/** 書籍1冊の詳細を取得する。販売停止・不存在は 404 BOOK_NOT_FOUND（FR-005a） */
export async function fetchBook(id: number | string): Promise<Book> {
  const data = await request<{ book: Book }>(`/api/books/${id}`);
  return data.book;
}

/** 注文を作成する。金額は送らない（サーバが算出する・FR-024） */
export async function createOrder(
  customer: CustomerInput,
  items: OrderItemInput[],
): Promise<OrderResult> {
  const data = await request<{ order: OrderResult }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ customer, items }),
  });
  return data.order;
}
