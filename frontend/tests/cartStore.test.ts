import { describe, it, expect, beforeEach, vi } from "vitest";
import { addItem, getItems } from "../src/app/lib/cartStore";

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
});
