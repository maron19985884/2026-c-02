// ===== DBクエリ結果の行型 =====

/** products テーブルの1行 */
export type ProductRow = {
  id:          number;
  title:       string;
  author:      string;
  price:       number;
  image_url:   string | null;
  description: string | null;
  created_at:  Date;
  updated_at:  Date | null;
};

/** orders テーブルの1行 */
export type OrderRow = {
  id:               number;
  order_number:     string;
  customer_name:    string;
  customer_address: string;
  customer_email:   string;
  total_amount:     number;
  created_at:       Date;
  updated_at:       Date | null;
};

/** order_items テーブルの1行 */
export type OrderItemRow = {
  id:         number;
  order_id:   number;
  product_id: number;
  title:      string;
  price:      number;
  quantity:   number;
  subtotal:   number;
  created_at: Date;
};

// ===== APIリクエスト型 =====

/** POST /api/orders リクエストボディ内のアイテム */
export type OrderItemRequest = {
  product_id: number;
  quantity:   number;
};

/** POST /api/orders リクエストボディ */
export type CreateOrderRequestBody = {
  customer_name:    string;
  customer_address: string;
  customer_email:   string;
  items:            OrderItemRequest[];
};

// ===== バリデーションエラー =====

/** バリデーションエラー情報 */
export type ValidationErrors = string[];
