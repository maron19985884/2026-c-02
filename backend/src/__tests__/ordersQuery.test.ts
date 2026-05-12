/**
 * Tests for src/db/ordersQuery.ts
 *
 * Covers:
 *  - createOrderWithItems: happy path, missing product error, DB errors,
 *    rollback on error, connection.release() in finally
 *  - getOrderById: found, not found, DB error
 *  - getOrderItemsByOrderId: with items, empty, DB error
 */

jest.mock('../db/pool');

import {
  createOrderWithItems,
  getOrderById,
  getOrderItemsByOrderId,
} from '../db/ordersQuery';
// Import through the same path so we get the same mock instance
import pool from '../db/pool';

// The __mocks__/pool.ts exports mockConnection; access it via the mocked pool.
// Since jest.mock replaces pool with the __mocks__ version, we can retrieve
// the mock connection through (pool.getConnection as jest.Mock).
const mockPoolQuery      = pool.query as jest.Mock;
const mockGetConnection  = pool.getConnection as jest.Mock;

// Typed refs to the connection mock methods — these are set in beforeEach
let mockExecute:         jest.Mock;
let mockBeginTx:         jest.Mock;
let mockCommit:          jest.Mock;
let mockRollback:        jest.Mock;
let mockRelease:         jest.Mock;
let mockConnectionQuery: jest.Mock;

// ─── helpers ────────────────────────────────────────────────────────────────

function makeProduct(id: number, price = 1000) {
  return {
    id, title: `Book ${id}`, author: 'A', price,
    image_url: null, description: null, created_at: new Date(), updated_at: null,
  };
}

function makeOrderRow(id = 1) {
  return {
    id,
    order_number:     `ORD-${String(id).padStart(10, '0')}`,
    customer_name:    'Taro',
    customer_address: 'Tokyo',
    customer_email:   'taro@example.com',
    total_amount:     2000,
    created_at:       new Date(),
    updated_at:       null,
  };
}

function makeOrderItemRow(orderId = 1, productId = 1) {
  return {
    id: 1, order_id: orderId, product_id: productId,
    title: `Book ${productId}`, price: 1000, quantity: 2, subtotal: 2000,
    created_at: new Date(),
  };
}

// ─── createOrderWithItems ────────────────────────────────────────────────────

describe('createOrderWithItems', () => {
  const defaultItems    = [{ product_id: 1, quantity: 2 }];
  const defaultProducts = [makeProduct(1, 1000)];

  function call(
    items    = defaultItems,
    products = defaultProducts,
    total    = 2000
  ) {
    return createOrderWithItems(
      'Taro Yamada', 'Tokyo', 'taro@example.com',
      total, items, products
    );
  }

  function setupConnection(insertId = 1) {
    // Build fresh mock functions for each test
    mockExecute         = jest.fn()
      .mockResolvedValueOnce([{ insertId }])  // INSERT orders
      .mockResolvedValueOnce([{}])             // UPDATE order_number
      .mockResolvedValueOnce([{}]);            // INSERT order_items
    mockBeginTx         = jest.fn().mockResolvedValue(undefined);
    mockCommit          = jest.fn().mockResolvedValue(undefined);
    mockRollback        = jest.fn().mockResolvedValue(undefined);
    mockRelease         = jest.fn();
    mockConnectionQuery = jest.fn().mockResolvedValueOnce([[makeOrderRow(insertId)]]);

    const connection = {
      beginTransaction: mockBeginTx,
      execute:          mockExecute,
      query:            mockConnectionQuery,
      commit:           mockCommit,
      rollback:         mockRollback,
      release:          mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setupConnection(1);
  });

  it('should call beginTransaction, commit, and release on success', async () => {
    await call();

    expect(mockBeginTx).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should return the created order row', async () => {
    const result = await call();

    expect(result.order_number).toBe('ORD-0000000001');
  });

  it('should INSERT into orders with correct parameters', async () => {
    await call();

    expect(mockExecute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO orders'),
      ['Taro Yamada', 'Tokyo', 'taro@example.com', 2000]
    );
  });

  it('should UPDATE order_number with zero-padded id', async () => {
    await call();

    expect(mockExecute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('UPDATE orders SET order_number'),
      ['ORD-0000000001', 1]
    );
  });

  it('should generate ORD-0000000042 for insertId=42', async () => {
    setupConnection(42);

    await call();

    expect(mockExecute).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      ['ORD-0000000042', 42]
    );
  });

  it('should INSERT order_items with correct subtotal calculation', async () => {
    await call();

    // subtotal = 1000 * 2 = 2000
    expect(mockExecute).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO order_items'),
      [1, 1, 'Book 1', 1000, 2, 2000]
    );
  });

  it('should handle multiple items correctly', async () => {
    const products = [makeProduct(1, 500), makeProduct(2, 1500)];
    const items    = [{ product_id: 1, quantity: 1 }, { product_id: 2, quantity: 2 }];

    // Need 4 execute calls: INSERT orders + UPDATE + 2x INSERT order_items
    mockExecute = jest.fn()
      .mockResolvedValueOnce([{ insertId: 5 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    mockConnectionQuery = jest.fn().mockResolvedValueOnce([[makeOrderRow(5)]]);
    const connection = {
      beginTransaction: mockBeginTx,
      execute: mockExecute,
      query: mockConnectionQuery,
      commit: mockCommit,
      rollback: mockRollback,
      release: mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);

    await call(items, products, 3500);

    expect(mockExecute).toHaveBeenCalledTimes(4);
    expect(mockExecute).toHaveBeenNthCalledWith(3, expect.any(String), [5, 1, 'Book 1', 500, 1, 500]);
    expect(mockExecute).toHaveBeenNthCalledWith(4, expect.any(String), [5, 2, 'Book 2', 1500, 2, 3000]);
  });

  it('should rollback when product is not found in the products map', async () => {
    // items reference product_id=99 but only product 1 is provided
    mockExecute = jest.fn()
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{}]);
    const connection = {
      beginTransaction: mockBeginTx,
      execute: mockExecute,
      query: mockConnectionQuery,
      commit: mockCommit,
      rollback: mockRollback,
      release: mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);

    await expect(
      call([{ product_id: 99, quantity: 1 }], [makeProduct(1)])
    ).rejects.toThrow('Product not found: 99');

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should rollback when INSERT orders fails', async () => {
    mockExecute = jest.fn().mockRejectedValueOnce(new Error('insert failed'));
    const connection = {
      beginTransaction: mockBeginTx, execute: mockExecute,
      query: mockConnectionQuery, commit: mockCommit,
      rollback: mockRollback, release: mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);

    await expect(call()).rejects.toThrow('insert failed');

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should rollback when UPDATE order_number fails', async () => {
    mockExecute = jest.fn()
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockRejectedValueOnce(new Error('update failed'));
    const connection = {
      beginTransaction: mockBeginTx, execute: mockExecute,
      query: mockConnectionQuery, commit: mockCommit,
      rollback: mockRollback, release: mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);

    await expect(call()).rejects.toThrow('update failed');

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should always call release even on error (finally block)', async () => {
    mockExecute = jest.fn().mockRejectedValueOnce(new Error('fatal'));
    const connection = {
      beginTransaction: mockBeginTx, execute: mockExecute,
      query: mockConnectionQuery, commit: mockCommit,
      rollback: mockRollback, release: mockRelease,
    };
    mockGetConnection.mockResolvedValue(connection);

    await expect(call()).rejects.toThrow('fatal');

    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('should call pool.getConnection exactly once', async () => {
    await call();

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
  });

  it('should query the created order by the new id after commit', async () => {
    setupConnection(7);

    await call();

    expect(mockConnectionQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [7]
    );
  });
});

// ─── getOrderById ────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the order when found', async () => {
    const order = makeOrderRow(3);
    mockPoolQuery.mockResolvedValueOnce([[order]]);

    const result = await getOrderById(3);

    expect(result).toEqual(order);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = ?'),
      [3]
    );
  });

  it('should return undefined when the order does not exist', async () => {
    mockPoolQuery.mockResolvedValueOnce([[]]);

    const result = await getOrderById(9999);

    expect(result).toBeUndefined();
  });

  it('should propagate database errors', async () => {
    mockPoolQuery.mockRejectedValueOnce(new Error('db down'));

    await expect(getOrderById(1)).rejects.toThrow('db down');
  });
});

// ─── getOrderItemsByOrderId ──────────────────────────────────────────────────

describe('getOrderItemsByOrderId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return order items when they exist', async () => {
    const items = [makeOrderItemRow(1, 1), makeOrderItemRow(1, 2)];
    mockPoolQuery.mockResolvedValueOnce([items]);

    const result = await getOrderItemsByOrderId(1);

    expect(result).toEqual(items);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE oi.order_id = ?'),
      [1]
    );
  });

  it('should return an empty array when no items exist', async () => {
    mockPoolQuery.mockResolvedValueOnce([[]]);

    const result = await getOrderItemsByOrderId(999);

    expect(result).toEqual([]);
  });

  it('should propagate database errors', async () => {
    mockPoolQuery.mockRejectedValueOnce(new Error('timeout'));

    await expect(getOrderItemsByOrderId(1)).rejects.toThrow('timeout');
  });
});
