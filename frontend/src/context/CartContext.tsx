"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "@/types/cart";

const CART_STORAGE_KEY = "bookstore.cart";

interface AddableBook {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
}

interface CartContextValue {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (book: AddableBook) => void;
  increaseQuantity: (bookId: number) => void;
  decreaseQuantity: (bookId: number) => void;
  removeItem: (bookId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCartFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  function addItem(book: AddableBook) {
    setItems((current) => {
      const existing = current.find((item) => item.bookId === book.id);
      if (existing) {
        return current.map((item) =>
          item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        { bookId: book.id, title: book.title, price: book.price, imageUrl: book.imageUrl, quantity: 1 },
      ];
    });
  }

  function increaseQuantity(bookId: number) {
    setItems((current) =>
      current.map((item) => (item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  function decreaseQuantity(bookId: number) {
    setItems((current) =>
      current.map((item) =>
        item.bookId === bookId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  }

  function removeItem(bookId: number) {
    setItems((current) => current.filter((item) => item.bookId !== bookId));
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{ items, isLoaded, addItem, increaseQuantity, decreaseQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
