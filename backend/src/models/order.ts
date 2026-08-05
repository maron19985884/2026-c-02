export interface OrderItemInput {
  bookId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  address: string;
  email: string;
  items: OrderItemInput[];
}

export interface OrderItemResult {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResult {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  items: OrderItemResult[];
  totalAmount: number;
}
