import type { CartItem } from "@/types/cart";
import type { CreateOrderResponse, CustomerInfo, GetOrderResponse } from "@/types/order";

// ブラウザから直接実行されるため、Dockerネットワーク内のサービス名ではなく
// ホストに公開されたポートを指す NEXT_PUBLIC_* を使用する
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// page.tsx はサーバーコンポーネントとしてコンテナ内部で fetch を実行するため、
// ブラウザ用の NEXT_PUBLIC_* ではなく Docker ネットワーク内のサービス名で解決する
const API_INTERNAL_BASE_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export async function createOrder(
  customerInfo: CustomerInfo,
  items: CartItem[]
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: customerInfo.name,
      customerAddress: customerInfo.address,
      customerEmail: customerInfo.email,
      items: items.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create order: ${res.status}`);
  }

  return res.json();
}

export async function fetchOrderByNumber(orderNumber: string): Promise<GetOrderResponse> {
  const res = await fetch(`${API_INTERNAL_BASE_URL}/api/orders/${orderNumber}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch order ${orderNumber}: ${res.status}`);
  }

  return res.json();
}
