"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Book, CartItem } from "@/types";

// ---------- State ----------
interface CartState {
  items: CartItem[];
}

// ---------- Actions ----------
type CartAction =
  | { type: "ADD"; book: Book }
  | { type: "UPDATE"; bookId: number; quantity: number }
  | { type: "REMOVE"; bookId: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

// ---------- Reducer ----------
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.book.id === action.book.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.book.id === action.book.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { book: action.book, quantity: 1 }] };
    }
    case "UPDATE": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.book.id !== action.bookId) };
      }
      return {
        items: state.items.map((i) =>
          i.book.id === action.bookId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.book.id !== action.bookId) };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

// ---------- Context ----------
interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bookstore_cart";

// ---------- Provider ----------
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // localStorage へ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = state.items.reduce(
    (s, i) => s + i.book.price * i.quantity,
    0
  );

  const value: CartContextValue = {
    items: state.items,
    totalCount,
    totalAmount,
    addToCart: (book) => dispatch({ type: "ADD", book }),
    updateQuantity: (bookId, quantity) =>
      dispatch({ type: "UPDATE", bookId, quantity }),
    removeFromCart: (bookId) => dispatch({ type: "REMOVE", bookId }),
    clearCart: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------- Hook ----------
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart は CartProvider 内で使用してください");
  return ctx;
}
