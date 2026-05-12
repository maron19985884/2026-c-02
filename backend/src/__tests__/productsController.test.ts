/**
 * Tests for src/controllers/productsController.ts
 *
 * Uses Supertest against a minimal Express app that registers the actual
 * products router, so the full HTTP pipeline (routing → controller) is exercised.
 * DB layer (productsQuery) is mocked via jest.mock().
 */

import request from 'supertest';
import express from 'express';
import productsRouter from '../routes/products';

// Mock the DB query module so no real database is hit
jest.mock('../db/productsQuery');
import { getAllProducts, getProductById } from '../db/productsQuery';

const mockGetAllProducts = getAllProducts as jest.Mock;
const mockGetProductById = getProductById as jest.Mock;

// ─── test app setup ──────────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productsRouter);
  return app;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function makeProduct(id = 1) {
  return {
    id,
    title:       `Book ${id}`,
    author:      'Author',
    price:       1500,
    image_url:   null,
    description: 'A great book',
    created_at:  new Date().toISOString(),
    updated_at:  null,
  };
}

// ─── GET /api/products ───────────────────────────────────────────────────────

describe('GET /api/products', () => {
  let app: express.Express;

  beforeAll(() => { app = buildApp(); });
  beforeEach(() => jest.clearAllMocks());

  it('should return 200 with a products array on success', async () => {
    const products = [makeProduct(1), makeProduct(2)];
    mockGetAllProducts.mockResolvedValueOnce(products);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ products });
  });

  it('should return 200 with an empty products array when no products exist', async () => {
    mockGetAllProducts.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ products: [] });
  });

  it('should return 500 when the database throws', async () => {
    mockGetAllProducts.mockRejectedValueOnce(new Error('DB failure'));

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});

// ─── GET /api/products/:id ───────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  let app: express.Express;

  beforeAll(() => { app = buildApp(); });
  beforeEach(() => jest.clearAllMocks());

  it('should return 200 with the product when found', async () => {
    const product = makeProduct(5);
    mockGetProductById.mockResolvedValueOnce(product);

    const res = await request(app).get('/api/products/5');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ product });
    expect(mockGetProductById).toHaveBeenCalledWith(5);
  });

  it('should return 404 when the product does not exist', async () => {
    mockGetProductById.mockResolvedValueOnce(undefined);

    const res = await request(app).get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
  });

  it('should return 400 for a non-integer id (string)', async () => {
    const res = await request(app).get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid product id' });
    expect(mockGetProductById).not.toHaveBeenCalled();
  });

  it('should return 400 for id = 0', async () => {
    const res = await request(app).get('/api/products/0');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid product id' });
  });

  it('should return 400 for a negative id', async () => {
    const res = await request(app).get('/api/products/-1');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid product id' });
  });

  it('should return 400 for a float id', async () => {
    const res = await request(app).get('/api/products/1.5');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid product id' });
  });

  it('should return 500 when the database throws', async () => {
    mockGetProductById.mockRejectedValueOnce(new Error('connection lost'));

    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});
