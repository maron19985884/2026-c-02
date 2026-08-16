const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type OrderItemRequest = {
  bookId: number;
  quantity: number;
};

export type OrderRequest = {
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  items: OrderItemRequest[];
};

export type OrderResponseItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type OrderResult = {
  orderNumber: string;
  totalAmount: number;
  items: OrderResponseItem[];
};

export class ValidationError extends Error {
  details: string[];

  constructor(details: string[]) {
    super("Order validation failed");
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnavailableItemsError extends Error {
  bookIds: number[];

  constructor(bookIds: number[]) {
    super("Some items are not available for order");
    this.name = "UnavailableItemsError";
    this.bookIds = bookIds;
  }
}

export async function createOrder(input: OrderRequest): Promise<OrderResult> {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 201) {
    return (await response.json()) as OrderResult;
  }

  if (response.status === 400) {
    const body = await response.json();
    if (body.error === "unavailable_items") {
      throw new UnavailableItemsError(body.bookIds ?? []);
    }
    throw new ValidationError(body.details ?? []);
  }

  throw new Error(`Request failed: ${response.status} /api/orders`);
}
