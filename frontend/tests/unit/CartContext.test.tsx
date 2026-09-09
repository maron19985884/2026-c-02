import { act, renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "@/context/CartContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const book = { id: 1, title: "Book A", price: 1000, imageUrl: "https://example.com/a.jpg" };
const otherBook = { id: 2, title: "Book B", price: 2000, imageUrl: null };

describe("CartContext", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("adds a new book to the cart with quantity 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
    });

    expect(result.current.items).toEqual([
      { bookId: 1, title: "Book A", price: 1000, imageUrl: "https://example.com/a.jpg", quantity: 1 },
    ]);
  });

  it("increments the quantity of an existing item instead of creating a new row", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.addItem(book);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("leaves other items untouched when incrementing one book's quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.addItem(otherBook);
      result.current.addItem(book);
    });

    expect(result.current.items).toEqual([
      { bookId: 1, title: "Book A", price: 1000, imageUrl: "https://example.com/a.jpg", quantity: 2 },
      { bookId: 2, title: "Book B", price: 2000, imageUrl: null, quantity: 1 },
    ]);
  });

  it("does not enforce an upper limit on quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      for (let i = 0; i < 10; i += 1) {
        result.current.addItem(book);
      }
    });

    expect(result.current.items[0].quantity).toBe(10);
  });

  it("restores cart contents from localStorage when the provider remounts", () => {
    const first = renderHook(() => useCart(), { wrapper });

    act(() => {
      first.result.current.addItem(book);
    });
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });

    expect(second.result.current.items).toEqual([
      { bookId: 1, title: "Book A", price: 1000, imageUrl: "https://example.com/a.jpg", quantity: 1 },
    ]);
  });

  it("falls back to an empty cart when localStorage contains malformed JSON", () => {
    window.localStorage.setItem("bookstore.cart", "not-valid-json");

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });

  it("throws when used outside of a CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow("useCart must be used within a CartProvider");
  });

  it("increases the quantity of the matching item without an upper limit", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      for (let i = 0; i < 9; i += 1) {
        result.current.increaseQuantity(book.id);
      }
    });

    expect(result.current.items[0].quantity).toBe(10);
  });

  it("decreases the quantity of the matching item down to a minimum of 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.increaseQuantity(book.id);
    });
    expect(result.current.items[0].quantity).toBe(2);

    act(() => {
      result.current.decreaseQuantity(book.id);
    });
    expect(result.current.items[0].quantity).toBe(1);

    act(() => {
      result.current.decreaseQuantity(book.id);
    });
    expect(result.current.items[0].quantity).toBe(1);
  });

  it("leaves other items untouched when increasing or decreasing one item's quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.addItem(otherBook);
      result.current.increaseQuantity(book.id);
    });

    expect(result.current.items).toEqual([
      { bookId: 1, title: "Book A", price: 1000, imageUrl: "https://example.com/a.jpg", quantity: 2 },
      { bookId: 2, title: "Book B", price: 2000, imageUrl: null, quantity: 1 },
    ]);
  });

  it("removes only the matching item from the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.addItem(otherBook);
      result.current.removeItem(book.id);
    });

    expect(result.current.items).toEqual([
      { bookId: 2, title: "Book B", price: 2000, imageUrl: null, quantity: 1 },
    ]);
  });

  it("empties the cart when clearCart is called", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(book);
      result.current.addItem(otherBook);
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
  });

  it("persists the cleared cart to localStorage", () => {
    const first = renderHook(() => useCart(), { wrapper });

    act(() => {
      first.result.current.addItem(book);
      first.result.current.clearCart();
    });
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });

    expect(second.result.current.items).toEqual([]);
  });
});
