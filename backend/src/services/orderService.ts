import { AppError } from "../middleware/errorHandler";
import { generateOrderNumber } from "../domain/orderNumber";
import { lineSubtotal, orderTotal } from "../domain/pricing";
import { validateOrderRequest } from "../domain/orderValidation";
import { findSellingByIds } from "../repositories/bookRepository";
import {
  findByOrderNumber,
  insertOrder,
  type OrderItemToInsert,
  type PersistedOrder,
} from "../repositories/orderRepository";

const MAX_ORDER_NUMBER_RETRIES = 3;

function isDuplicateKeyError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

/**
 * 注文を作成する（D-08）。
 * 1. items の bookId 群の現在値を取得（selling のみ）
 * 2. 検証（失敗は 400 / fields）
 * 3. 単価・小計・合計をサーバ再計算、書名/単価をスナップショット化
 * 4. 注文番号を発行（重複時リトライ）→ トランザクションで永続化
 */
export async function createOrder(body: unknown): Promise<PersistedOrder> {
  const root = (typeof body === "object" && body !== null ? body : {}) as {
    items?: unknown;
  };
  const rawItems = Array.isArray(root.items) ? (root.items as unknown[]) : [];
  const candidateIds = [
    ...new Set(
      rawItems
        .map((i) => (typeof i === "object" && i !== null ? (i as { bookId?: unknown }).bookId : undefined))
        .filter((v): v is number => typeof v === "number" && Number.isInteger(v) && v > 0),
    ),
  ];

  const foundBooks = await findSellingByIds(candidateIds);

  const { fields, normalized } = validateOrderRequest(body, foundBooks);
  if (!normalized) {
    throw new AppError(400, "VALIDATION_ERROR", "validation failed", fields);
  }

  const itemsToInsert: OrderItemToInsert[] = normalized.items.map((it) => {
    const book = foundBooks.get(it.bookId);
    // normalized 生成時に存在確認済みのため book は必ず存在する
    if (!book) {
      throw new AppError(400, "VALIDATION_ERROR", "validation failed", {
        items: "現在購入できない書籍がカートに含まれています",
      });
    }
    const unitPrice = book.price;
    return {
      bookId: book.id,
      titleSnapshot: book.title,
      unitPriceSnapshot: unitPrice,
      quantity: it.quantity,
      subtotal: lineSubtotal(unitPrice, it.quantity),
    };
  });

  const totalAmount = orderTotal(
    itemsToInsert.map((i) => ({ unitPrice: i.unitPriceSnapshot, quantity: i.quantity })),
  );

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_RETRIES; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      await insertOrder(
        {
          orderNumber,
          customerName: normalized.customer.name,
          customerAddress: normalized.customer.address,
          customerEmail: normalized.customer.email,
          totalAmount,
        },
        itemsToInsert,
      );

      const persisted = await findByOrderNumber(orderNumber);
      if (!persisted) {
        throw new AppError(500, "INTERNAL_ERROR", "order persisted but not found");
      }
      return persisted;
    } catch (e) {
      if (isDuplicateKeyError(e)) {
        continue; // 注文番号が偶然衝突 → 採番し直し
      }
      throw e;
    }
  }

  throw new AppError(
    500,
    "INTERNAL_ERROR",
    `failed to allocate a unique order number after ${MAX_ORDER_NUMBER_RETRIES} attempts`,
  );
}

/** GET /api/orders/:orderNumber。 */
export async function getOrder(orderNumber: string): Promise<PersistedOrder | null> {
  return findByOrderNumber(orderNumber);
}
