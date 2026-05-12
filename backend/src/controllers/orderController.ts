import { Request, Response } from 'express';
import { createOrder, findOrderById } from '../models/orderModel';
import { ApiResponse, CreateOrderRequest, Order, OrderWithItems } from '../types';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function postOrder(req: Request, res: Response): Promise<void> {
  try {
    const { customer_name, customer_address, customer_email, items } = req.body as Partial<CreateOrderRequest>;

    if (!customer_name?.trim() || !customer_address?.trim() || !customer_email?.trim()) {
      const body: ApiResponse<null> = { data: null, error: '氏名・住所・メールアドレスは必須です', message: 'Bad request' };
      res.status(400).json(body);
      return;
    }
    if (!isValidEmail(customer_email)) {
      const body: ApiResponse<null> = { data: null, error: 'メールアドレスの形式が正しくありません', message: 'Bad request' };
      res.status(400).json(body);
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      const body: ApiResponse<null> = { data: null, error: '注文商品がありません', message: 'Bad request' };
      res.status(400).json(body);
      return;
    }

    const order = await createOrder({ customer_name, customer_address, customer_email, items });
    const body: ApiResponse<Order> = { data: order, error: null, message: '注文を受け付けました' };
    res.status(201).json(body);
  } catch (err) {
    const body: ApiResponse<null> = { data: null, error: String(err), message: 'Internal server error' };
    res.status(500).json(body);
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const body: ApiResponse<null> = { data: null, error: 'Invalid id', message: 'Bad request' };
      res.status(400).json(body);
      return;
    }
    const order = await findOrderById(id);
    if (!order) {
      const body: ApiResponse<null> = { data: null, error: 'Not found', message: 'Order not found' };
      res.status(404).json(body);
      return;
    }
    const body: ApiResponse<OrderWithItems> = { data: order, error: null, message: 'OK' };
    res.json(body);
  } catch (err) {
    const body: ApiResponse<null> = { data: null, error: String(err), message: 'Internal server error' };
    res.status(500).json(body);
  }
}
