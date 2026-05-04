export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  book_id: number;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_address: string;
  items: { book_id: number; quantity: number }[];
}

export interface CreateOrderResponse {
  id: number;
  order_number: string;
  total_amount: number;
}
