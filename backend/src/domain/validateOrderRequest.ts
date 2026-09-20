/**
 * 注文リクエストの検証。
 *
 * 詳細設計書 DETAIL-004 §2.3 / contracts/orders-api.md に対応。
 *
 * フロントの `validateOrderForm.ts` と同一の規則を実装する。
 * バックエンドは最終防衛線であり、フロントの検証を通過した前提に立たない。
 * 金額はリクエストに含めず、含まれていても無視する（改ざん防止・FR-024）。
 */

export type FieldErrorCode =
  | "REQUIRED"
  | "TOO_LONG"
  | "INVALID_FORMAT"
  | "EMPTY"
  | "INVALID_QUANTITY"
  | "DUPLICATE_BOOK";

export interface ValidationResult {
  valid: boolean;
  fields: Record<string, FieldErrorCode>;
}

export const MAX_NAME_LENGTH = 100;
export const MAX_ADDRESS_LENGTH = 255;
export const MAX_EMAIL_LENGTH = 255;

/**
 * メールアドレスの形式判定。
 * ローカル部・`@`・ドメイン部（ドットを含む）の構造のみを見る。
 * 実在確認・到達確認は行わない（spec.md Assumptions）。
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function checkText(
  value: unknown,
  maxLength: number,
): FieldErrorCode | undefined {
  if (typeof value !== "string") return "REQUIRED";
  const trimmed = value.trim();
  if (trimmed.length === 0) return "REQUIRED";
  if (trimmed.length > maxLength) return "TOO_LONG";
  return undefined;
}

interface CustomerLike {
  name?: unknown;
  address?: unknown;
  email?: unknown;
}

interface ItemLike {
  bookId?: unknown;
  quantity?: unknown;
}

interface RequestLike {
  customer?: CustomerLike;
  items?: unknown;
}

export function validateOrderRequest(input: RequestLike): ValidationResult {
  const fields: Record<string, FieldErrorCode> = {};
  const customer = input.customer ?? {};

  const nameError = checkText(customer.name, MAX_NAME_LENGTH);
  if (nameError) fields.name = nameError;

  const addressError = checkText(customer.address, MAX_ADDRESS_LENGTH);
  if (addressError) fields.address = addressError;

  const emailError = checkText(customer.email, MAX_EMAIL_LENGTH);
  if (emailError) {
    fields.email = emailError;
  } else if (!isValidEmail((customer.email as string).trim())) {
    fields.email = "INVALID_FORMAT";
  }

  const items = input.items;
  if (!Array.isArray(items) || items.length === 0) {
    fields.items = "EMPTY";
  } else {
    const seen = new Set<number>();
    for (const entry of items as ItemLike[]) {
      const bookId = entry?.bookId;
      const quantity = entry?.quantity;

      if (
        !Number.isInteger(quantity) ||
        (quantity as number) < 1 ||
        !Number.isInteger(bookId) ||
        (bookId as number) <= 0
      ) {
        fields.items = "INVALID_QUANTITY";
        break;
      }
      if (seen.has(bookId as number)) {
        // カート側で1書籍1行が保証されているため、重複は不正な入力とみなす（FR-009）
        fields.items = "DUPLICATE_BOOK";
        break;
      }
      seen.add(bookId as number);
    }
  }

  return { valid: Object.keys(fields).length === 0, fields };
}
