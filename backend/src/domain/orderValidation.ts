import type { BookRow } from "../repositories/bookRepository";
import type { ErrorFields } from "../middleware/errorHandler";

// メールアドレスの実用的サブセット（前後端で同一仕様にすること）。
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  name: 255,
  address: 1000,
  email: 255,
  minQuantity: 1,
  maxQuantity: 99,
} as const;

export interface NormalizedItem {
  bookId: number;
  quantity: number;
}

export interface NormalizedOrder {
  customer: { name: string; address: string; email: string };
  items: NormalizedItem[];
}

export interface ValidationResult {
  fields: ErrorFields;
  /** fields が空のときのみ有効 */
  normalized?: NormalizedOrder;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * 注文リクエストを検証する。副作用なし。
 * `foundBooks` は呼び出し元が books から取得した「現在・販売中」の書籍 (id -> row)。
 */
export function validateOrderRequest(body: unknown, foundBooks: Map<number, BookRow>): ValidationResult {
  const fields: ErrorFields = {};
  const root = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const customerRaw = (typeof root.customer === "object" && root.customer !== null
    ? root.customer
    : {}) as Record<string, unknown>;

  const name = asString(customerRaw.name).trim();
  const address = asString(customerRaw.address).trim();
  const email = asString(customerRaw.email).trim();

  if (name.length === 0) {
    fields.name = "氏名を入力してください";
  } else if (name.length > LIMITS.name) {
    fields.name = `氏名は${LIMITS.name}文字以内で入力してください`;
  }

  if (address.length === 0) {
    fields.address = "住所を入力してください";
  } else if (address.length > LIMITS.address) {
    fields.address = `住所は${LIMITS.address}文字以内で入力してください`;
  }

  if (email.length === 0) {
    fields.email = "メールアドレスを入力してください";
  } else if (email.length > LIMITS.email) {
    fields.email = `メールアドレスは${LIMITS.email}文字以内で入力してください`;
  } else if (!EMAIL_PATTERN.test(email)) {
    fields.email = "メールアドレスの形式が正しくありません";
  }

  const itemsRaw = Array.isArray(root.items) ? (root.items as unknown[]) : [];
  const normalizedItems: NormalizedItem[] = [];

  if (itemsRaw.length === 0) {
    fields.items = "カートが空です";
  } else {
    // 同一 bookId は合算（防御的 / CL-002）
    const merged = new Map<number, number>();
    let itemError: string | undefined;

    for (const raw of itemsRaw) {
      const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
      const bookId = obj.bookId;
      const quantity = obj.quantity;

      if (typeof bookId !== "number" || !Number.isInteger(bookId) || bookId <= 0) {
        itemError = "カートに不正な商品が含まれています";
        break;
      }
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < LIMITS.minQuantity ||
        quantity > LIMITS.maxQuantity
      ) {
        itemError = `数量は${LIMITS.minQuantity}〜${LIMITS.maxQuantity}の範囲で指定してください`;
        break;
      }
      if (!foundBooks.has(bookId)) {
        itemError = "現在購入できない書籍がカートに含まれています";
        break;
      }
      merged.set(bookId, (merged.get(bookId) ?? 0) + quantity);
    }

    if (itemError) {
      fields.items = itemError;
    } else {
      for (const [bookId, quantity] of merged) {
        if (quantity > LIMITS.maxQuantity) {
          fields.items = `数量は${LIMITS.maxQuantity}冊までにしてください`;
          break;
        }
        normalizedItems.push({ bookId, quantity });
      }
    }
  }

  if (Object.keys(fields).length > 0) {
    return { fields };
  }

  return {
    fields,
    normalized: { customer: { name, address, email }, items: normalizedItems },
  };
}
