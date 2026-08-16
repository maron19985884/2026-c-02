import { describe, it, expect, beforeEach, vi } from "vitest";
import { addItem, getItems, updateQuantity, removeItem, clear } from "../src/app/lib/cartStore";

describe("cartStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds a new book with quantity 1", () => {
    addItem(1);

    expect(getItems()).toEqual([{ bookId: 1, quantity: 1 }]);
  });

  it("increments the quantity when the same book is added again", () => {
    addItem(1);
    addItem(1);

    expect(getItems()).toEqual([{ bookId: 1, quantity: 2 }]);
  });

  it("keeps separate entries for different books", () => {
    addItem(1);
    addItem(2);

    expect(getItems()).toEqual([
      { bookId: 1, quantity: 1 },
      { bookId: 2, quantity: 1 },
    ]);
  });

  it("does not throw when localStorage.setItem fails", () => {
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => addItem(1)).not.toThrow();
  });

  it("returns an empty array when stored data is corrupted", () => {
    window.localStorage.setItem("cart", "not valid json");

    expect(getItems()).toEqual([]);
  });

  describe("updateQuantity", () => {
    it("updates the quantity of the specified item", () => {
      addItem(1);

      const result = updateQuantity(1, 5);

      expect(result).toBe(true);
      expect(getItems()).toEqual([{ bookId: 1, quantity: 5 }]);
    });

    it("does not allow quantity below 1", () => {
      addItem(1);

      const result = updateQuantity(1, 0);

      expect(result).toBe(false);
      expect(getItems()).toEqual([{ bookId: 1, quantity: 1 }]);
    });

    it("does not throw when localStorage.setItem fails", () => {
      addItem(1);
      vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => updateQuantity(1, 3)).not.toThrow();
      expect(updateQuantity(1, 3)).toBe(false);
    });
  });

  describe("removeItem", () => {
    it("removes the specified item from the cart", () => {
      addItem(1);
      addItem(2);

      const result = removeItem(1);

      expect(result).toBe(true);
      expect(getItems()).toEqual([{ bookId: 2, quantity: 1 }]);
    });

    it("does not throw when localStorage.setItem fails", () => {
      addItem(1);
      vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => removeItem(1)).not.toThrow();
      expect(removeItem(1)).toBe(false);
    });
  });

  describe("clear", () => {
    it("empties the cart", () => {
      addItem(1);
      addItem(2);

      const result = clear();

      expect(result).toBe(true);
      expect(getItems()).toEqual([]);
    });

    it("does not throw when localStorage.setItem fails", () => {
      vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => clear()).not.toThrow();
      expect(clear()).toBe(false);
    });
  });
});
