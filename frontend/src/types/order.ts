export interface CustomerInfo {
  name: string;
  address: string;
  email: string;
}

export interface OrderFormErrors {
  name?: string;
  address?: string;
  email?: string;
}

export interface CreateOrderResponse {
  orderNumber: string;
  totalAmount: number;
}

export interface GetOrderResponse {
  orderNumber: string;
}
