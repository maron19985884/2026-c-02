// ===== API レスポンス型 =====

/** 商品 */
export type Product = {
  id:          number;
  title:       string;
  author:      string;
  price:       number;
  image_url:   string | null;
  description: string | null;
};

/** 注文（POST /api/orders レスポンス） */
export type Order = {
  id:             number;
  order_number:   string;
  customer_name:  string;
  customer_email: string;
  total_amount:   number;
  created_at:     string;
};

/** 注文明細付き注文（GET /api/orders/:id レスポンス） */
export type OrderDetail = Order & {
  customer_address: string;
  items: OrderItem[];
};

/** 注文明細 */
export type OrderItem = {
  product_id: number;
  title:      string;
  price:      number;
  quantity:   number;
  subtotal:   number;
};

// ===== カート型 =====

/** localStorageに保存するカートアイテム */
export type CartItem = {
  product_id: number;
  title:      string;
  price:      number;
  quantity:   number;
};

// ===== API リクエスト型 =====

/** POST /api/orders リクエストボディ */
export type CreateOrderRequest = {
  customer_name:    string;
  customer_address: string;
  customer_email:   string;
  items: Array<{
    product_id: number;
    quantity:   number;
  }>;
};

// ===== フォーム型 =====

/** 注文フォームの入力値 */
export type OrderFormValues = {
  customer_name:    string;
  customer_address: string;
  customer_email:   string;
};

/** フォームバリデーションエラー */
export type FormErrors = Partial<Record<keyof OrderFormValues, string>>;

// ===== API エラー型 =====

/** バックエンドエラーレスポンス */
export type ApiError = {
  error:    string;
  details?: string[];
};
