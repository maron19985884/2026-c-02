/**
 * Tests for src/hooks/useCart.ts
 *
 * The hook uses localStorage (browser API). In jsdom environment we have
 * a real localStorage, which we spy on / reset between tests.
 *
 * Covers:
 *  - Initial state (empty cart)
 *  - loadCart from localStorage on mount
 *  - loadCart when localStorage.getItem returns null
 *  - loadCart when localStorage contains invalid JSON (catch branch)
 *  - saveCart on items change (after initialized)
 *  - addItem: new product and existing product (quantity increment)
 *  - updateQuantity: valid quantity, quantity < 1 (no-op)
 *  - removeItem
 *  - clearCart
 *  - totalAmount and totalCount derived values
 *  - initialized flag lifecycle
 */

import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';

const CART_KEY = 'bookstore_cart';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeProduct(id: number, price = 1000) {
  return { id, title: `Book ${id}`, price };
}

function cartItem(productId: number, quantity: number, price = 1000) {
  return { product_id: productId, title: `Book ${productId}`, price, quantity };
}

// ─── test suite ───────────────────────────────────────────────────────────────

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ── Initialization ──────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should start with empty items and initialized=false before mount effects run', () => {
      // Arrange: empty localStorage
      const { result } = renderHook(() => useCart());

      // After all effects run synchronously in testing-library, initialized=true
      // but items should still be [] if localStorage was empty
      expect(result.current.items).toEqual([]);
    });

    it('should set initialized=true after the mount effect runs', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.initialized).toBe(true);
    });

    it('should load items from localStorage on mount', () => {
      const stored = [cartItem(1, 2)];
      localStorage.setItem(CART_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual(stored);
    });

    it('should return an empty array when localStorage key does not exist', () => {
      // localStorage is clear; getItem returns null
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
    });

    it('should return an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(CART_KEY, 'not-valid-json{{{');

      const { result } = renderHook(() => useCart());

      // loadCart catches the parse error and returns []
      expect(result.current.items).toEqual([]);
    });
  });

  // ── saveCart (write-back effect) ─────────────────────────────────────────────

  describe('saveCart', () => {
    it('should persist items to localStorage when initialized and items change', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
      });

      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      expect(stored).toEqual([cartItem(1, 1)]);
    });

    it('should write an empty cart to localStorage after initialization with no items', () => {
      // renderHook flushes all effects: initialized becomes true, then
      // the save effect runs writing [] to localStorage.
      localStorage.clear();
      renderHook(() => useCart());

      // After effects run, save wrote the (empty) cart to storage
      const stored = localStorage.getItem(CART_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual([]);
    });
  });

  // ── addItem ───────────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('should add a new product with quantity 1', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1, 1500));
      });

      expect(result.current.items).toEqual([cartItem(1, 1, 1500)]);
    });

    it('should increment quantity when the same product is added again', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(1));
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should not modify other items when incrementing an existing product', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
        result.current.addItem(makeProduct(1)); // increment product 1
      });

      expect(result.current.items).toHaveLength(2);
      const item1 = result.current.items.find(i => i.product_id === 1);
      const item2 = result.current.items.find(i => i.product_id === 2);
      expect(item1?.quantity).toBe(2);
      expect(item2?.quantity).toBe(1);
    });

    it('should add multiple different products', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
        result.current.addItem(makeProduct(3));
      });

      expect(result.current.items).toHaveLength(3);
    });
  });

  // ── updateQuantity ────────────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    it('should update the quantity of a given product', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });
      act(() => { result.current.updateQuantity(1, 5); });

      const item = result.current.items.find(i => i.product_id === 1);
      expect(item?.quantity).toBe(5);
    });

    it('should not change items when quantity < 1 (quantity = 0)', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });
      const before = result.current.items[0].quantity;

      act(() => { result.current.updateQuantity(1, 0); });

      expect(result.current.items[0].quantity).toBe(before);
    });

    it('should not change items when quantity is negative', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });

      act(() => { result.current.updateQuantity(1, -3); });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should not modify other items when updating one', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
      });

      act(() => { result.current.updateQuantity(1, 10); });

      const item2 = result.current.items.find(i => i.product_id === 2);
      expect(item2?.quantity).toBe(1); // unchanged
    });

    it('should accept quantity = 1 (boundary)', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });
      act(() => { result.current.addItem(makeProduct(1)); }); // quantity = 2
      act(() => { result.current.updateQuantity(1, 1); });

      expect(result.current.items[0].quantity).toBe(1);
    });
  });

  // ── removeItem ────────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('should remove the specified item from the cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
      });

      act(() => { result.current.removeItem(1); });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product_id).toBe(2);
    });

    it('should leave the cart unchanged when removing a non-existent product_id', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });
      act(() => { result.current.removeItem(999); }); // not in cart

      expect(result.current.items).toHaveLength(1);
    });

    it('should result in an empty cart when the last item is removed', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1)); });
      act(() => { result.current.removeItem(1); });

      expect(result.current.items).toEqual([]);
    });
  });

  // ── clearCart ─────────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should empty the cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
      });

      act(() => { result.current.clearCart(); });

      expect(result.current.items).toEqual([]);
    });

    it('should be a no-op when the cart is already empty', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.clearCart(); });

      expect(result.current.items).toEqual([]);
    });
  });

  // ── derived values ────────────────────────────────────────────────────────────

  describe('totalAmount', () => {
    it('should return 0 for an empty cart', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.totalAmount).toBe(0);
    });

    it('should return price * quantity for a single item', () => {
      const { result } = renderHook(() => useCart());

      act(() => { result.current.addItem(makeProduct(1, 500)); });
      act(() => { result.current.updateQuantity(1, 3); });

      expect(result.current.totalAmount).toBe(1500);
    });

    it('should sum price * quantity across all items', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1, 1000));
        result.current.addItem(makeProduct(2, 2000));
      });
      act(() => { result.current.updateQuantity(2, 2); });

      // 1000 * 1 + 2000 * 2 = 5000
      expect(result.current.totalAmount).toBe(5000);
    });
  });

  describe('totalCount', () => {
    it('should return 0 for an empty cart', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.totalCount).toBe(0);
    });

    it('should return the sum of all quantities', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(makeProduct(1));
        result.current.addItem(makeProduct(2));
      });
      act(() => { result.current.updateQuantity(1, 3); });

      // product 1: qty 3, product 2: qty 1 → total 4
      expect(result.current.totalCount).toBe(4);
    });
  });

  // ── return shape ──────────────────────────────────────────────────────────────

  describe('return value shape', () => {
    it('should expose all expected fields', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('initialized');
      expect(result.current).toHaveProperty('totalAmount');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('addItem');
      expect(result.current).toHaveProperty('updateQuantity');
      expect(result.current).toHaveProperty('removeItem');
      expect(result.current).toHaveProperty('clearCart');
    });
  });
});
