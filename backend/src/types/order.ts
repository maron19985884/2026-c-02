export type OrderItemRequest = {
  bookId: number;
  quantity: number;
};

export type OrderRequest = {
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  items: OrderItemRequest[];
};

export type CreateOrderInput = OrderRequest;

export type OrderResponseItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type OrderResult = {
  orderNumber: string;
  totalAmount: number;
  items: OrderResponseItem[];
};
