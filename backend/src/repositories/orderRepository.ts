import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../db/pool";
import type { CreateOrderInput, OrderResult, OrderResponseItem } from "../types/order";

export class UnavailableItemsError extends Error {
  bookIds: number[];

  constructor(bookIds: number[]) {
    super("Some items are not available for order");
    this.name = "UnavailableItemsError";
    this.bookIds = bookIds;
  }
}

function formatOrderNumber(id: number): string {
  return `ORD-${String(id).padStart(6, "0")}`;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookIds = input.items.map((item) => item.bookId);
    const [bookRows] = await connection.query<RowDataPacket[]>(
      `SELECT id, title, price FROM books WHERE id IN (${bookIds.map(() => "?").join(",")}) AND is_for_sale = 1`,
      bookIds
    );

    const bookById = new Map(bookRows.map((row) => [row.id as number, row]));
    const unavailableBookIds = bookIds.filter((bookId) => !bookById.has(bookId));

    if (unavailableBookIds.length > 0) {
      await connection.rollback();
      throw new UnavailableItemsError(unavailableBookIds);
    }

    const responseItems: OrderResponseItem[] = input.items.map((item) => {
      const book = bookById.get(item.bookId)!;
      return {
        bookId: item.bookId,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
        subtotal: book.price * item.quantity,
      };
    });
    const totalAmount = responseItems.reduce((sum, item) => sum + item.subtotal, 0);

    const [orderResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO orders (customer_name, customer_address, customer_email, total_amount) VALUES (?, ?, ?, ?)",
      [input.customerName, input.customerAddress, input.customerEmail, totalAmount]
    );
    const orderId = orderResult.insertId;

    for (const item of responseItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.bookId, item.title, item.price, item.quantity]
      );
    }

    await connection.commit();

    return {
      orderNumber: formatOrderNumber(orderId),
      totalAmount,
      items: responseItems,
    };
  } catch (error) {
    if (!(error instanceof UnavailableItemsError)) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release();
  }
}
