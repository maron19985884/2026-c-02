export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
}

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

export interface OrderItem {
  book_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_address: string;
  customer_email: string;
  items: OrderItem[];
}

export interface Order {
  id: number;
  customer_name: string;
  customer_address: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { title: string })[];
}
