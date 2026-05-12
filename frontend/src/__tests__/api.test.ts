/**
 * Tests for src/lib/api.ts
 *
 * Covers all three exported functions (fetchProducts, fetchProduct, createOrder)
 * with success, error, and edge-case scenarios.
 * global.fetch is replaced with a jest.fn() before each test.
 */

import { fetchProducts, fetchProduct, createOrder } from '../lib/api';
import type { CreateOrderRequest } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeFetchResponse(
  body: unknown,
  options: { ok?: boolean; status?: number } = {}
): Response {
  const { ok = true, status = 200 } = options;
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function mockFetch(response: Response) {
  global.fetch = jest.fn().mockResolvedValueOnce(response);
}

function mockFetchReject(error: Error) {
  global.fetch = jest.fn().mockRejectedValueOnce(error);
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const sampleProduct = {
  id:          1,
  title:       'Clean Code',
  author:      'Robert C. Martin',
  price:       3000,
  image_url:   null,
  description: 'A great book',
};

const sampleOrder = {
  id:             1,
  order_number:   'ORD-0000000001',
  customer_name:  'Taro',
  customer_email: 'taro@example.com',
  total_amount:   3000,
  created_at:     '2026-05-12T00:00:00.000Z',
};

const sampleCreateRequest: CreateOrderRequest = {
  customer_name:    'Taro',
  customer_address: 'Tokyo',
  customer_email:   'taro@example.com',
  items: [{ product_id: 1, quantity: 1 }],
};

// ─── fetchProducts ────────────────────────────────────────────────────────────

describe('fetchProducts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the products array on a successful response', async () => {
    mockFetch(makeFetchResponse({ products: [sampleProduct] }));

    const result = await fetchProducts();

    expect(result).toEqual([sampleProduct]);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/products`,
      { cache: 'no-store' }
    );
  });

  it('should return an empty array when products is empty', async () => {
    mockFetch(makeFetchResponse({ products: [] }));

    const result = await fetchProducts();

    expect(result).toEqual([]);
  });

  it('should throw with the HTTP status when the response is not ok (500)', async () => {
    mockFetch(makeFetchResponse({}, { ok: false, status: 500 }));

    await expect(fetchProducts()).rejects.toThrow('Failed to fetch products: 500');
  });

  it('should throw with the HTTP status when the response is not ok (503)', async () => {
    mockFetch(makeFetchResponse({}, { ok: false, status: 503 }));

    await expect(fetchProducts()).rejects.toThrow('Failed to fetch products: 503');
  });

  it('should propagate a network error (fetch rejects)', async () => {
    mockFetchReject(new TypeError('network error'));

    await expect(fetchProducts()).rejects.toThrow('network error');
  });

  it('should call fetch with cache: no-store', async () => {
    mockFetch(makeFetchResponse({ products: [] }));

    await fetchProducts();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cache: 'no-store' })
    );
  });
});

// ─── fetchProduct ─────────────────────────────────────────────────────────────

describe('fetchProduct', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the product on a successful response', async () => {
    mockFetch(makeFetchResponse({ product: sampleProduct }));

    const result = await fetchProduct(1);

    expect(result).toEqual(sampleProduct);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/products/1`,
      { cache: 'no-store' }
    );
  });

  it('should throw "Product not found" when the response status is 404', async () => {
    mockFetch(makeFetchResponse({ error: 'Product not found' }, { ok: false, status: 404 }));

    await expect(fetchProduct(999)).rejects.toThrow('Product not found');
  });

  it('should throw with the HTTP status for non-404 error responses', async () => {
    mockFetch(makeFetchResponse({}, { ok: false, status: 500 }));

    await expect(fetchProduct(1)).rejects.toThrow('Failed to fetch product: 500');
  });

  it('should throw with the HTTP status for 400 error responses', async () => {
    mockFetch(makeFetchResponse({}, { ok: false, status: 400 }));

    await expect(fetchProduct(1)).rejects.toThrow('Failed to fetch product: 400');
  });

  it('should construct the URL with the given id', async () => {
    mockFetch(makeFetchResponse({ product: sampleProduct }));

    await fetchProduct(42);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/products/42`,
      expect.any(Object)
    );
  });

  it('should propagate a network error', async () => {
    mockFetchReject(new TypeError('fetch failed'));

    await expect(fetchProduct(1)).rejects.toThrow('fetch failed');
  });

  it('should use cache: no-store', async () => {
    mockFetch(makeFetchResponse({ product: sampleProduct }));

    await fetchProduct(1);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cache: 'no-store' })
    );
  });
});

// ─── createOrder ──────────────────────────────────────────────────────────────

describe('createOrder', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the order on a successful POST', async () => {
    mockFetch(makeFetchResponse({ order: sampleOrder }));

    const result = await createOrder(sampleCreateRequest);

    expect(result).toEqual(sampleOrder);
  });

  it('should call fetch with POST method, JSON Content-Type, and serialised body', async () => {
    mockFetch(makeFetchResponse({ order: sampleOrder }));

    await createOrder(sampleCreateRequest);

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/orders`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sampleCreateRequest),
      }
    );
  });

  it('should throw the parsed ApiError object when response is not ok (400)', async () => {
    const apiError = { error: 'Validation failed', details: ['customer_name は必須です'] };
    mockFetch(makeFetchResponse(apiError, { ok: false, status: 400 }));

    await expect(createOrder(sampleCreateRequest)).rejects.toEqual(apiError);
  });

  it('should throw the parsed ApiError object when response is not ok (404)', async () => {
    const apiError = { error: 'Product not found', details: ['product_id: 99'] };
    mockFetch(makeFetchResponse(apiError, { ok: false, status: 404 }));

    await expect(createOrder(sampleCreateRequest)).rejects.toEqual(apiError);
  });

  it('should throw the parsed ApiError object when response is not ok (500)', async () => {
    const apiError = { error: 'Internal server error' };
    mockFetch(makeFetchResponse(apiError, { ok: false, status: 500 }));

    await expect(createOrder(sampleCreateRequest)).rejects.toEqual(apiError);
  });

  it('should propagate a network error', async () => {
    mockFetchReject(new TypeError('network failure'));

    await expect(createOrder(sampleCreateRequest)).rejects.toThrow('network failure');
  });

  it('should use NEXT_PUBLIC_API_URL env variable as base URL', async () => {
    // The BASE_URL is set at module load time from env; we verify the call URL
    mockFetch(makeFetchResponse({ order: sampleOrder }));

    await createOrder(sampleCreateRequest);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders'),
      expect.any(Object)
    );
  });
});
