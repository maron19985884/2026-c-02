export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  coverImageUrl: string;
  createdAt: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  address: string;
  email: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface BookSnapshot {
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  snapshot: BookSnapshot;
}

export interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isLoaded: boolean;
  add: (bookId: string, snapshot: BookSnapshot) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  remove: (bookId: string) => void;
  clear: () => void;
}

export interface CreateOrderPayload {
  customerName: string;
  address: string;
  email: string;
  items: { bookId: string; quantity: number }[];
}

export interface OrderFormValues {
  customerName: string;
  address: string;
  email: string;
}

export interface OrderFormErrors {
  customerName?: string;
  address?: string;
  email?: string;
}

export interface LastOrderData {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}
