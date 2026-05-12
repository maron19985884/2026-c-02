/**
 * Tests for src/db/productsQuery.ts
 *
 * jest.mock('../db/pool') triggers the automatic manual mock at
 * src/db/__mocks__/pool.ts. The mocked pool is imported through
 * the normal '../db/pool' path so we reference the same mock instance
 * that productsQuery.ts uses.
 */

jest.mock('../db/pool');

import { getAllProducts, getProductById, getProductsByIds } from '../db/productsQuery';
// Import the mocked pool through the same path productsQuery.ts uses
import pool from '../db/pool';

const mockQuery = pool.query as jest.Mock;

// ─── helpers ────────────────────────────────────────────────────────────────

function makeProduct(id = 1) {
  return {
    id,
    title:       `Book ${id}`,
    author:      'Author',
    price:       1000 + id,
    image_url:   null,
    description: null,
    created_at:  new Date(),
    updated_at:  null,
  };
}

// ─── getAllProducts ──────────────────────────────────────────────────────────

describe('getAllProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return all product rows on success', async () => {
    const rows = [makeProduct(1), makeProduct(2)];
    mockQuery.mockResolvedValueOnce([rows]);

    const result = await getAllProducts();

    expect(result).toEqual(rows);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT')
    );
  });

  it('should return an empty array when no products exist', async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    const result = await getAllProducts();

    expect(result).toEqual([]);
  });

  it('should propagate database errors', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    await expect(getAllProducts()).rejects.toThrow('DB error');
  });

  it('should use ORDER BY id ASC in the SQL query', async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    await getAllProducts();

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY id ASC')
    );
  });
});

// ─── getProductById ──────────────────────────────────────────────────────────

describe('getProductById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the product row when found', async () => {
    const product = makeProduct(5);
    mockQuery.mockResolvedValueOnce([[product]]);

    const result = await getProductById(5);

    expect(result).toEqual(product);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = ?'),
      [5]
    );
  });

  it('should return undefined when the product does not exist', async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    const result = await getProductById(999);

    expect(result).toBeUndefined();
  });

  it('should propagate database errors', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection lost'));

    await expect(getProductById(1)).rejects.toThrow('connection lost');
  });

  it('should pass the id as a parameterised value', async () => {
    mockQuery.mockResolvedValueOnce([[makeProduct(42)]]);

    await getProductById(42);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [42]);
  });
});

// ─── getProductsByIds ────────────────────────────────────────────────────────

describe('getProductsByIds', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return an empty array immediately when ids is empty (no DB call)', async () => {
    const result = await getProductsByIds([]);

    expect(result).toEqual([]);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should return matching products for a non-empty id list', async () => {
    const products = [makeProduct(1), makeProduct(2)];
    mockQuery.mockResolvedValueOnce([products]);

    const result = await getProductsByIds([1, 2]);

    expect(result).toEqual(products);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('IN (?)'),
      [[1, 2]]
    );
  });

  it('should work with a single id', async () => {
    const product = makeProduct(7);
    mockQuery.mockResolvedValueOnce([[product]]);

    const result = await getProductsByIds([7]);

    expect(result).toEqual([product]);
  });

  it('should propagate database errors', async () => {
    mockQuery.mockRejectedValueOnce(new Error('timeout'));

    await expect(getProductsByIds([1])).rejects.toThrow('timeout');
  });
});
