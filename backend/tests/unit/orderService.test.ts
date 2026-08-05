import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema';
import { OrderService, BookNotFoundError } from '../../src/services/orderService';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  initSchema(db);
  db.prepare(
    'INSERT INTO books (title, author, price, description, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run('Book A', 'Author A', 1000, 'desc', 'img');
  db.prepare(
    'INSERT INTO books (title, author, price, description, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run('Book B', 'Author B', 500, 'desc', 'img');
  return db;
}

describe('OrderService.createOrder', () => {
  it('computes subtotals and total, and persists a snapshot of book title/price', () => {
    const db = createTestDb();
    const service = new OrderService(db);

    const result = service.createOrder({
      customerName: '山田太郎',
      address: '東京都',
      email: 'taro@example.com',
      items: [
        { bookId: 1, quantity: 2 },
        { bookId: 2, quantity: 1 },
      ],
    });

    expect(result.items).toEqual([
      { bookId: 1, title: 'Book A', price: 1000, quantity: 2, subtotal: 2000 },
      { bookId: 2, title: 'Book B', price: 500, quantity: 1, subtotal: 500 },
    ]);
    expect(result.totalAmount).toBe(2500);
    expect(result.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);

    const storedOrder = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(result.orderNumber);
    expect(storedOrder).toBeDefined();
    const storedItems = db.prepare('SELECT * FROM order_items').all();
    expect(storedItems).toHaveLength(2);
  });

  it('throws BookNotFoundError when an item references a non-existent book', () => {
    const db = createTestDb();
    const service = new OrderService(db);

    expect(() =>
      service.createOrder({
        customerName: '山田太郎',
        address: '東京都',
        email: 'taro@example.com',
        items: [{ bookId: 999, quantity: 1 }],
      })
    ).toThrow(BookNotFoundError);
  });

  it('increments the daily sequence for a second order on the same day', () => {
    const db = createTestDb();
    const service = new OrderService(db);
    const input = {
      customerName: '山田太郎',
      address: '東京都',
      email: 'taro@example.com',
      items: [{ bookId: 1, quantity: 1 }],
    };

    const first = service.createOrder(input);
    const second = service.createOrder(input);

    const firstSeq = first.orderNumber.split('-')[2];
    const secondSeq = second.orderNumber.split('-')[2];
    expect(Number(secondSeq)).toBe(Number(firstSeq) + 1);
  });
});
