/**
 * Tests for src/controllers/ordersController.ts
 *
 * Covers every validation branch, the product-not-found path, total amount
 * calculation, successful order creation, and all error paths.
 */

import request from 'supertest';
import express from 'express';
import ordersRouter from '../routes/orders';

jest.mock('../db/productsQuery');
jest.mock('../db/ordersQuery');

import { getProductsByIds } from '../db/productsQuery';
import { createOrderWithItems, getOrderById, getOrderItemsByOrderId } from '../db/ordersQuery';

const mockGetProductsByIds     = getProductsByIds     as jest.Mock;
const mockCreateOrderWithItems = createOrderWithItems as jest.Mock;
const mockGetOrderById         = getOrderById         as jest.Mock;
const mockGetOrderItemsByOrderId = getOrderItemsByOrderId as jest.Mock;

// ─── app setup ───────────────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', ordersRouter);
  return app;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeProduct(id: number, price = 1000) {
  return { id, title: `Book ${id}`, author: 'A', price, image_url: null, description: null, created_at: new Date(), updated_at: null };
}

function makeOrderRow(id = 1) {
  return {
    id,
    order_number:     `ORD-${String(id).padStart(10, '0')}`,
    customer_name:    'Taro',
    customer_address: 'Tokyo',
    customer_email:   'taro@example.com',
    total_amount:     2000,
    created_at:       new Date().toISOString(),
    updated_at:       null,
  };
}

function makeOrderItemRow(productId = 1) {
  return { id: 1, order_id: 1, product_id: productId, title: 'Book 1', price: 1000, quantity: 2, subtotal: 2000, created_at: new Date() };
}

const validBody = {
  customer_name:    'Taro Yamada',
  customer_address: 'Tokyo 1-1-1',
  customer_email:   'taro@example.com',
  items: [{ product_id: 1, quantity: 2 }],
};

// ─── POST /api/orders ─────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  let app: express.Express;

  beforeAll(() => { app = buildApp(); });
  beforeEach(() => jest.clearAllMocks());

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('should return 201 with order on success', async () => {
    const products = [makeProduct(1, 1000)];
    const order    = makeOrderRow(1);
    mockGetProductsByIds.mockResolvedValueOnce(products);
    mockCreateOrderWithItems.mockResolvedValueOnce(order);

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.order).toMatchObject({
      id:             order.id,
      order_number:   order.order_number,
      customer_name:  order.customer_name,
      customer_email: order.customer_email,
      total_amount:   order.total_amount,
    });
  });

  it('should calculate total amount from DB prices (not client-supplied)', async () => {
    // price in DB is 500; items has qty 3 → total = 1500
    const products = [makeProduct(1, 500)];
    const order    = makeOrderRow(1);
    mockGetProductsByIds.mockResolvedValueOnce(products);
    mockCreateOrderWithItems.mockResolvedValueOnce(order);

    const body = { ...validBody, items: [{ product_id: 1, quantity: 3 }] };
    await request(app).post('/api/orders').send(body);

    expect(mockCreateOrderWithItems).toHaveBeenCalledWith(
      body.customer_name,
      body.customer_address,
      body.customer_email,
      1500, // 500 * 3
      body.items,
      products
    );
  });

  it('should sum totals across multiple items', async () => {
    const products = [makeProduct(1, 500), makeProduct(2, 1500)];
    const order    = makeOrderRow(5);
    mockGetProductsByIds.mockResolvedValueOnce(products);
    mockCreateOrderWithItems.mockResolvedValueOnce(order);

    const body = {
      ...validBody,
      items: [
        { product_id: 1, quantity: 1 },  // 500
        { product_id: 2, quantity: 2 },  // 3000
      ],
    };
    await request(app).post('/api/orders').send(body);

    expect(mockCreateOrderWithItems).toHaveBeenCalledWith(
      expect.any(String), expect.any(String), expect.any(String),
      3500, // 500 + 3000
      expect.any(Array),
      products
    );
  });

  // ── Validation: customer_name ────────────────────────────────────────────────

  it('should return 400 when customer_name is missing', async () => {
    const body = { ...validBody, customer_name: '' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_name は必須です');
  });

  it('should return 400 when customer_name is whitespace only', async () => {
    const body = { ...validBody, customer_name: '   ' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_name は必須です');
  });

  it('should return 400 when customer_name exceeds 100 characters', async () => {
    const body = { ...validBody, customer_name: 'A'.repeat(101) };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_name は100文字以内で入力してください');
  });

  it('should accept customer_name of exactly 100 characters', async () => {
    const products = [makeProduct(1)];
    mockGetProductsByIds.mockResolvedValueOnce(products);
    mockCreateOrderWithItems.mockResolvedValueOnce(makeOrderRow(1));

    const body = { ...validBody, customer_name: 'A'.repeat(100) };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(201);
  });

  // ── Validation: customer_address ─────────────────────────────────────────────

  it('should return 400 when customer_address is missing', async () => {
    const body = { ...validBody, customer_address: '' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_address は必須です');
  });

  it('should return 400 when customer_address is whitespace only', async () => {
    const body = { ...validBody, customer_address: '   ' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_address は必須です');
  });

  it('should return 400 when customer_address exceeds 255 characters', async () => {
    const body = { ...validBody, customer_address: 'A'.repeat(256) };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_address は255文字以内で入力してください');
  });

  // ── Validation: customer_email ────────────────────────────────────────────────

  it('should return 400 when customer_email is missing', async () => {
    const body = { ...validBody, customer_email: '' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_email は必須です');
  });

  it('should return 400 when customer_email is whitespace only', async () => {
    const body = { ...validBody, customer_email: '   ' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_email は必須です');
  });

  it('should return 400 when customer_email exceeds 255 characters', async () => {
    const body = { ...validBody, customer_email: 'a'.repeat(250) + '@b.com' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_email は255文字以内で入力してください');
  });

  it('should return 400 when customer_email has invalid format (no @)', async () => {
    const body = { ...validBody, customer_email: 'notanemail' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_email の形式が正しくありません');
  });

  it('should return 400 when customer_email has invalid format (no domain)', async () => {
    const body = { ...validBody, customer_email: 'user@' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('customer_email の形式が正しくありません');
  });

  // ── Validation: items ────────────────────────────────────────────────────────

  it('should return 400 when items is not an array', async () => {
    const body = { ...validBody, items: 'not-array' };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('items は1件以上必要です');
  });

  it('should return 400 when items is an empty array', async () => {
    const body = { ...validBody, items: [] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details).toContain('items は1件以上必要です');
  });

  it('should return 400 when an item has invalid product_id (string)', async () => {
    const body = { ...validBody, items: [{ product_id: 'abc', quantity: 1 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('product_id が不正'))).toBe(true);
  });

  it('should return 400 when an item has product_id = 0', async () => {
    const body = { ...validBody, items: [{ product_id: 0, quantity: 1 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('product_id が不正'))).toBe(true);
  });

  it('should return 400 when an item has negative product_id', async () => {
    const body = { ...validBody, items: [{ product_id: -1, quantity: 1 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('product_id が不正'))).toBe(true);
  });

  it('should return 400 when an item has float product_id', async () => {
    const body = { ...validBody, items: [{ product_id: 1.5, quantity: 1 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('product_id が不正'))).toBe(true);
  });

  it('should return 400 when an item has quantity = 0', async () => {
    const body = { ...validBody, items: [{ product_id: 1, quantity: 0 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('quantity は1以上'))).toBe(true);
  });

  it('should return 400 when an item has negative quantity', async () => {
    const body = { ...validBody, items: [{ product_id: 1, quantity: -1 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('quantity は1以上'))).toBe(true);
  });

  it('should return 400 when an item has float quantity', async () => {
    const body = { ...validBody, items: [{ product_id: 1, quantity: 1.5 }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('quantity は1以上'))).toBe(true);
  });

  it('should return 400 when an item has string quantity', async () => {
    const body = { ...validBody, items: [{ product_id: 1, quantity: 'two' }] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d: string) => d.includes('quantity は1以上'))).toBe(true);
  });

  it('should accumulate multiple validation errors', async () => {
    const body = { customer_name: '', customer_address: '', customer_email: '', items: [] };
    const res  = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(1);
  });

  // ── Product not found ────────────────────────────────────────────────────────

  it('should return 404 when one product_id does not exist in DB', async () => {
    // Only product 1 exists; items requests product 2
    mockGetProductsByIds.mockResolvedValueOnce([makeProduct(1)]);

    const body = {
      ...validBody,
      items: [
        { product_id: 1, quantity: 1 },
        { product_id: 2, quantity: 1 },
      ],
    };
    const res = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
    expect(res.body.details).toContain('product_id: 2');
  });

  it('should return 404 listing all missing product_ids', async () => {
    mockGetProductsByIds.mockResolvedValueOnce([]); // nothing found

    const body = {
      ...validBody,
      items: [{ product_id: 10, quantity: 1 }, { product_id: 20, quantity: 1 }],
    };
    const res = await request(app).post('/api/orders').send(body);

    expect(res.status).toBe(404);
    expect(res.body.details).toContain('product_id: 10');
    expect(res.body.details).toContain('product_id: 20');
  });

  // ── Deduplication of product_ids ─────────────────────────────────────────────

  it('should deduplicate product_ids before querying DB', async () => {
    const products = [makeProduct(1, 500)];
    mockGetProductsByIds.mockResolvedValueOnce(products);
    mockCreateOrderWithItems.mockResolvedValueOnce(makeOrderRow(1));

    // Two items with the same product_id
    const body = { ...validBody, items: [{ product_id: 1, quantity: 1 }, { product_id: 1, quantity: 2 }] };
    await request(app).post('/api/orders').send(body);

    // getProductsByIds should be called with [1] (deduplicated), not [1,1]
    expect(mockGetProductsByIds).toHaveBeenCalledWith([1]);
  });

  // ── DB / createOrder errors ──────────────────────────────────────────────────

  it('should return 500 when getProductsByIds throws', async () => {
    mockGetProductsByIds.mockRejectedValueOnce(new Error('db down'));

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('should return 500 when createOrderWithItems throws', async () => {
    mockGetProductsByIds.mockResolvedValueOnce([makeProduct(1)]);
    mockCreateOrderWithItems.mockRejectedValueOnce(new Error('tx failed'));

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {
  let app: express.Express;

  beforeAll(() => { app = buildApp(); });
  beforeEach(() => jest.clearAllMocks());

  it('should return 200 with order and items on success', async () => {
    const order = makeOrderRow(1);
    const items = [makeOrderItemRow(1)];
    mockGetOrderById.mockResolvedValueOnce(order);
    mockGetOrderItemsByOrderId.mockResolvedValueOnce(items);

    const res = await request(app).get('/api/orders/1');

    expect(res.status).toBe(200);
    expect(res.body.order).toMatchObject({
      id:             order.id,
      order_number:   order.order_number,
      customer_name:  order.customer_name,
      customer_address: order.customer_address,
      customer_email: order.customer_email,
      total_amount:   order.total_amount,
    });
    expect(res.body.order.items).toHaveLength(1);
    expect(res.body.order.items[0]).toMatchObject({
      product_id: items[0].product_id,
      title:      items[0].title,
      price:      items[0].price,
      quantity:   items[0].quantity,
      subtotal:   items[0].subtotal,
    });
  });

  it('should return 200 with empty items array when order has no items', async () => {
    mockGetOrderById.mockResolvedValueOnce(makeOrderRow(2));
    mockGetOrderItemsByOrderId.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/orders/2');

    expect(res.status).toBe(200);
    expect(res.body.order.items).toEqual([]);
  });

  it('should return 404 when the order does not exist', async () => {
    mockGetOrderById.mockResolvedValueOnce(undefined);

    const res = await request(app).get('/api/orders/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Order not found' });
    expect(mockGetOrderItemsByOrderId).not.toHaveBeenCalled();
  });

  it('should return 400 for a non-integer id', async () => {
    const res = await request(app).get('/api/orders/abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid order id' });
    expect(mockGetOrderById).not.toHaveBeenCalled();
  });

  it('should return 400 for id = 0', async () => {
    const res = await request(app).get('/api/orders/0');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid order id' });
  });

  it('should return 400 for a negative id', async () => {
    const res = await request(app).get('/api/orders/-5');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid order id' });
  });

  it('should return 400 for a float id', async () => {
    const res = await request(app).get('/api/orders/2.7');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid order id' });
  });

  it('should return 500 when getOrderById throws', async () => {
    mockGetOrderById.mockRejectedValueOnce(new Error('db error'));

    const res = await request(app).get('/api/orders/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('should return 500 when getOrderItemsByOrderId throws', async () => {
    mockGetOrderById.mockResolvedValueOnce(makeOrderRow(1));
    mockGetOrderItemsByOrderId.mockRejectedValueOnce(new Error('items error'));

    const res = await request(app).get('/api/orders/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});
