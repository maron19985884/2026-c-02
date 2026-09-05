// バックエンド REST API とやり取りする型定義（contracts/ と対応）

export interface BookSummary {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}

export interface BookDetail extends BookSummary {
  description: string;
}

export interface BooksListResponse {
  items: BookSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface OrderRequestItem {
  bookId: number;
  quantity: number;
}

export interface OrderRequest {
  customer: {
    name: string;
    address: string;
    email: string;
  };
  items: OrderRequestItem[];
}

export interface OrderResponseItem {
  bookId: number;
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  orderNumber: string;
  orderedAt: string;
  customer: {
    name: string;
    address: string;
    email: string;
  };
  items: OrderResponseItem[];
  totalAmount: number;
}

/** POST /api/orders の 400 で返る項目別エラー */
export interface OrderFieldErrors {
  name?: string;
  address?: string;
  email?: string;
  items?: string;
}
