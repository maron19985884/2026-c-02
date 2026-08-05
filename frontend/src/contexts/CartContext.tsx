import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import {
  CartItem,
  BookLike,
  addItem,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  cartTotal,
} from '@/lib/cart';

interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  addBook: (book: BookLike) => void;
  increase: (bookId: number) => void;
  decrease: (bookId: number) => void;
  remove: (bookId: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalAmount: cartTotal(items),
      addBook: (book) => setItems((prev) => addItem(prev, book)),
      increase: (bookId) => setItems((prev) => increaseQuantity(prev, bookId)),
      decrease: (bookId) => setItems((prev) => decreaseQuantity(prev, bookId)),
      remove: (bookId) => setItems((prev) => removeItem(prev, bookId)),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
