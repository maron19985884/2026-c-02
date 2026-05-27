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

export interface CreateOrderItemRequest {
  bookId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  address: string;
  email: string;
  items: CreateOrderItemRequest[];
}

export interface ApiErrorResponse {
  error: string;
}
