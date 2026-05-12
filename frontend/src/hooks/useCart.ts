'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from 'react';
import { Book, CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (book: Book) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeItem: (bookId: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'bookstore_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((book: Book) => {
    setItems(prev => {
      const existing = prev.find(i => i.book.id === book.id);
      if (existing) {
        return prev.map(i => i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((bookId: number, quantity: number) => {
    setItems(prev => prev.map(i => i.book.id === bookId ? { ...i, quantity } : i));
  }, []);

  const removeItem = useCallback((bookId: number) => {
    setItems(prev => prev.filter(i => i.book.id !== bookId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalAmount = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  return createElement(CartContext.Provider, { value: { items, addItem, updateQuantity, removeItem, clearCart, totalAmount } }, children);
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
