import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/pool";
import { generateOrderNumber } from "../lib/generateOrderNumber";
import type { CreateOrderRequest, CreateOrderResponse, GetOrderResponse } from "../types/order";

interface BookPriceRow extends RowDataPacket {
  id: number;
  title: string;
  price: number;
}

interface OrderNumberRow extends RowDataPacket {
  order_number: string;
}

export class BookNotFoundError extends Error {
  constructor(bookId: number) {
    super(`Book not found: ${bookId}`);
  }
}

export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const items = await Promise.all(
      request.items.map(async ({ bookId, quantity }) => {
        const [rows] = await connection.query<BookPriceRow[]>(
          "SELECT id, title, price FROM books WHERE id = ?",
          [bookId]
        );
        const book = rows[0];
        if (!book) {
          throw new BookNotFoundError(bookId);
        }
        return {
          bookId: book.id,
          bookTitle: book.title,
          unitPrice: book.price,
          quantity,
          subtotal: book.price * quantity,
        };
      })
    );

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = generateOrderNumber();

    const [orderResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO orders (order_number, customer_name, customer_address, customer_email, total_amount) VALUES (?, ?, ?, ?, ?)",
      [orderNumber, request.customerName, request.customerAddress, request.customerEmail, totalAmount]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, book_id, book_title, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
        [orderId, item.bookId, item.bookTitle, item.unitPrice, item.quantity, item.subtotal]
      );
    }

    await connection.commit();

    return { orderNumber, totalAmount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<GetOrderResponse | null> {
  const [rows] = await pool.query<OrderNumberRow[]>(
    "SELECT order_number FROM orders WHERE order_number = ?",
    [orderNumber]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return { orderNumber: row.order_number };
}
