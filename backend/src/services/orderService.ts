import Database from 'better-sqlite3';
import { CreateOrderInput, OrderResult, OrderItemResult } from '../models/order';
import { generateOrderNumber } from './orderNumber';

export class BookNotFoundError extends Error {
  bookId: number;

  constructor(bookId: number) {
    super(`Book not found: ${bookId}`);
    this.bookId = bookId;
  }
}

interface BookRow {
  id: number;
  title: string;
  price: number;
}

export class OrderService {
  constructor(private db: Database.Database) {}

  createOrder(input: CreateOrderInput): OrderResult {
    const getBook = this.db.prepare('SELECT id, title, price FROM books WHERE id = ?');

    const items: OrderItemResult[] = input.items.map((requestedItem) => {
      const book = getBook.get(requestedItem.bookId) as BookRow | undefined;
      if (!book) {
        throw new BookNotFoundError(requestedItem.bookId);
      }
      const subtotal = book.price * requestedItem.quantity;
      return {
        bookId: book.id,
        title: book.title,
        price: book.price,
        quantity: requestedItem.quantity,
        subtotal,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const createdAt = new Date().toISOString();
    const orderNumber = this.nextOrderNumber(new Date(createdAt));

    const insertOrder = this.db.prepare(
      `INSERT INTO orders (order_number, customer_name, address, email, total_amount, created_at)
       VALUES (@orderNumber, @customerName, @address, @email, @totalAmount, @createdAt)`
    );
    const insertItem = this.db.prepare(
      `INSERT INTO order_items (order_id, book_id, title, price, quantity, subtotal)
       VALUES (@orderId, @bookId, @title, @price, @quantity, @subtotal)`
    );

    const transaction = this.db.transaction(() => {
      const result = insertOrder.run({
        orderNumber,
        customerName: input.customerName,
        address: input.address,
        email: input.email,
        totalAmount,
        createdAt,
      });
      const orderId = result.lastInsertRowid as number;
      for (const item of items) {
        insertItem.run({ orderId, ...item });
      }
    });
    transaction();

    return { orderNumber, createdAt, customerName: input.customerName, items, totalAmount };
  }

  /** 同じ日の注文件数+1を連番として使う（research.md「6. 注文番号の採番方式」） */
  private nextOrderNumber(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const dayPrefix = `ORD-${y}${m}${d}-`;

    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?')
      .get(`${dayPrefix}%`) as { count: number };

    return generateOrderNumber(date, row.count + 1);
  }
}
