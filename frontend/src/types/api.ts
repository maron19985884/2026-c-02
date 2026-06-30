export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface OrderItemRequest {
  bookId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  customerName: string;
  address: string;
  email: string;
  items: OrderItemRequest[];
  totalAmount: number;
}

export interface CreateOrderResponse {
  orderNumber: string;
}

export interface ErrorResponse {
  error: string;
}
