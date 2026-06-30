// API Types: オンライン書店 購買フロー
// Spec: specs/001-purchase-flow/spec.md
// Contracts: specs/001-purchase-flow/contracts/api-contracts.md

// ── Backend response types ──────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;       // 円単位（整数）
  description: string;
  imageUrl: string;
}

// ── Client-side cart types (localStorage only, not sent to server) ──────────

export interface CartItem {
  book: Book;
  quantity: number;    // 1以上
}

// ── Order request/response ──────────────────────────────────────────────────

export interface OrderItemRequest {
  bookId: number;
  quantity: number;
  unitPrice: number;   // 注文時点の価格スナップショット
}

export interface CreateOrderRequest {
  customerName: string;
  address: string;
  email: string;
  items: OrderItemRequest[];
  totalAmount: number; // 円単位（整数）
}

export interface CreateOrderResponse {
  orderNumber: string; // "ORD-XXXXXX" 形式
}

// ── Error response ──────────────────────────────────────────────────────────

export interface ErrorResponse {
  error: string;
}
