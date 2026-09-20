/**
 * 共有型定義とエラー応答のファクトリ。
 *
 * 詳細設計書 DETAIL-004 §2.7 / research.md D-11 に対応。
 * エラー応答は `{ error: { code, message, details? } }` の形に統一する。
 */

// ------------------------------------------------------------
// ドメイン型
// ------------------------------------------------------------

/** 一覧で返す書籍（説明文を含まない） */
export interface BookSummary {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string | null;
}

/** 詳細で返す書籍（説明文を含む） */
export interface Book extends BookSummary {
  description: string;
}

/** 注文作成リクエストの顧客情報 */
export interface CustomerInput {
  name: string;
  address: string;
  email: string;
}

/** 注文作成リクエストの明細 */
export interface OrderItemInput {
  bookId: number;
  quantity: number;
}

/** 注文作成リクエスト。金額は受け取らない（サーバ側で算出する・FR-024） */
export interface OrderRequest {
  customer: CustomerInput;
  items: OrderItemInput[];
}

/** 注文時点のスナップショット（FR-024 / SC-006） */
export interface OrderItemSnapshot {
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** 注文作成の結果。内部 ID (`orders.id`) は含めない（FR-029b） */
export interface OrderResult {
  orderNumber: string;
  totalAmount: number;
  items: OrderItemSnapshot[];
}

// ------------------------------------------------------------
// エラー
// ------------------------------------------------------------

/** エラーコード。contracts/README.md の一覧と対応する */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "BOOK_NOT_FOUND"
  | "BOOKS_UNAVAILABLE"
  | "INTERNAL_ERROR";

/** エラー応答の本文 */
export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * エラー応答オブジェクトを生成する。
 * スタックトレース・SQL・接続情報を含めてはならない（contracts/README.md）。
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiError {
  return details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } };
}

/**
 * HTTP ステータスと対応付けてスローするためのエラー。
 * `errorHandler` がこれを検出して応答へ変換する。
 */
export class HttpError extends Error {
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
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
