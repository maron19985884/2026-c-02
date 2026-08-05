export interface BookLike {
  id: number;
  title: string;
  price: number;
}

export interface CartItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
}

export const MIN_QUANTITY = 1;

/** 同一書籍が既にあれば数量を加算する（FR-021） */
export function addItem(items: CartItem[], book: BookLike): CartItem[] {
  const existing = items.find((item) => item.bookId === book.id);
  if (existing) {
    return items.map((item) => (item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item));
  }
  return [...items, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }];
}

export function increaseQuantity(items: CartItem[], bookId: number): CartItem[] {
  return items.map((item) => (item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item));
}

/** 数量の下限は1（FR-022） */
export function decreaseQuantity(items: CartItem[], bookId: number): CartItem[] {
  return items.map((item) =>
    item.bookId === bookId ? { ...item, quantity: Math.max(MIN_QUANTITY, item.quantity - 1) } : item
  );
}

export function removeItem(items: CartItem[], bookId: number): CartItem[] {
  return items.filter((item) => item.bookId !== bookId);
}

export function itemSubtotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + itemSubtotal(item), 0);
}
