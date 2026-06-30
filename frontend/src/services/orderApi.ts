import { CreateOrderRequest, CreateOrderResponse } from "../types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function createOrder(
  req: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to create order");
  }
  return res.json();
}
