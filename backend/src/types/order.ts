export interface OrderItem {
  bookId: number;
  bookTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface CreateOrderRequestItem {
  bookId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  items: CreateOrderRequestItem[];
}

export interface CreateOrderResponse {
  orderNumber: string;
  totalAmount: number;
}

export interface GetOrderResponse {
  orderNumber: string;
}
