import type { Product, Order, CreateOrderRequest } from '@/types';

/**
 * バックエンドのベースURLを返す。
 * サーバーサイド（Server Component等）では Docker ネットワーク内のサービス名を使用し、
 * クライアントサイド（ブラウザ）ではホストOSから見えるポートマッピングを使用する。
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // サーバーサイド実行: Docker ネットワーク内でバックエンドコンテナに直接接続
    return process.env.INTERNAL_API_URL || 'http://backend:4000';
  }
  // クライアントサイド実行: ブラウザからホスト経由で接続
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

/**
 * 商品一覧を取得する
 * cache: 'no-store' を指定して常に最新データを取得する
 */
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${getBaseUrl()}/api/products`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const data = await res.json();
  return data.products as Product[];
}

/**
 * 商品詳細を取得する
 * 404の場合は 'Product not found' エラーをスローする
 */
export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    cache: 'no-store',
  });
  if (res.status === 404) throw new Error('Product not found');
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  const data = await res.json();
  return data.product as Product;
}

/**
 * 注文を作成する
 * エラー時はバックエンドのエラーレスポンス（ApiError）をそのままスローする
 */
export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  const res = await fetch(`${getBaseUrl()}/api/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err; // ApiError をそのままスロー
  }
  const data = await res.json();
  return data.order as Order;
}
