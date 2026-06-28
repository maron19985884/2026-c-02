import { CartItem } from '../types';

const API_BASE = '/api';

interface OrderRequest {
  customer_name: string;
  customer_address: string;
  customer_email: string;
  items: Array<{
    book_id: number;
    quantity: number;
    unit_price: number;
  }>;
}

interface OrderResponse {
  order_number: string;
}

export async function createOrder(
  customerName: string,
  customerAddress: string,
  customerEmail: string,
  cartItems: CartItem[]
): Promise<OrderResponse> {
  const body: OrderRequest = {
    customer_name: customerName,
    customer_address: customerAddress,
    customer_email: customerEmail,
    items: cartItems.map((item) => ({
      book_id: item.bookId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  };

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json();
    throw data;
  }
  return res.json();
}
