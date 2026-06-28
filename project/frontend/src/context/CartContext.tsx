import React, { createContext, useContext, useState, useMemo } from 'react';
import { Book, CartItem, CartContextValue } from '../types';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  function addToCart(book: Book, quantity = 1): void {
    setItems((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        // 同一書籍が存在する場合は数量を加算する（FR-002: 重複エントリ禁止）
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          bookId: book.id,
          title: book.title,
          author: book.author,
          unitPrice: book.price,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(bookId: number, quantity: number): void {
    // 数量下限は1（FR-010: 1未満への変更は無視する）
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    );
  }

  function removeFromCart(bookId: number): void {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
  }

  function clearCart(): void {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{ items, totalAmount, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
