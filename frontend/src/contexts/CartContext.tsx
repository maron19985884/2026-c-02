'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem, CartContextValue, BookSnapshot } from '@/types';

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        localStorage.removeItem('cart');
      }
    }
    setIsLoaded(true);
  }, []);

  const add = useCallback((bookId: string, snapshot: BookSnapshot) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === bookId);
      const next = existing
        ? prev.map((i) =>
            i.bookId === bookId ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...prev, { bookId, quantity: 1, snapshot }];
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.bookId === bookId ? { ...i, quantity } : i,
      );
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((bookId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.bookId !== bookId);
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, i) => sum + i.snapshot.price * i.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    totalCount,
    totalAmount,
    isLoaded,
    add,
    updateQuantity,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
