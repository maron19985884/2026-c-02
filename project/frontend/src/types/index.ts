export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string | null;
  image_url: string | null;
}

export interface CartItem {
  bookId: number;
  title: string;
  author: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
}

export interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  addToCart: (book: Book, quantity?: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
}
