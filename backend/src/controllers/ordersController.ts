import { Request, Response } from 'express';
import { getProductsByIds } from '../db/productsQuery';
import { createOrderWithItems, getOrderById, getOrderItemsByOrderId } from '../db/ordersQuery';
import type { CreateOrderRequestBody, ValidationErrors } from '../types';

// メールアドレスの簡易RFC5322検証に使用する正規表現
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/orders
 * 注文を作成する
 * バリデーション → 商品存在確認 → 合計金額計算 → トランザクションでINSERT
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateOrderRequestBody;

  // ===== バリデーション =====
  const details: ValidationErrors = [];

  // customer_name のバリデーション
  if (!body.customer_name || !body.customer_name.trim()) {
    details.push('customer_name は必須です');
  } else if (body.customer_name.length > 100) {
    details.push('customer_name は100文字以内で入力してください');
  }

  // customer_address のバリデーション
  if (!body.customer_address || !body.customer_address.trim()) {
    details.push('customer_address は必須です');
  } else if (body.customer_address.length > 255) {
    details.push('customer_address は255文字以内で入力してください');
  }

  // customer_email のバリデーション
  if (!body.customer_email || !body.customer_email.trim()) {
    details.push('customer_email は必須です');
  } else if (body.customer_email.length > 255) {
    details.push('customer_email は255文字以内で入力してください');
  } else if (!EMAIL_REGEX.test(body.customer_email)) {
    details.push('customer_email の形式が正しくありません');
  }

  // items のバリデーション
  if (!Array.isArray(body.items) || body.items.length === 0) {
    details.push('items は1件以上必要です');
  } else {
    for (const item of body.items) {
      if (
        typeof item.product_id !== 'number' ||
        !Number.isInteger(item.product_id) ||
        item.product_id <= 0
      ) {
        details.push(`items の product_id が不正です: ${item.product_id}`);
      }
      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        details.push(`items の quantity は1以上の整数である必要があります`);
      }
    }
  }

  // バリデーション失敗時は400を返す
  if (details.length > 0) {
    res.status(400).json({ error: 'Validation failed', details });
    return;
  }

  // ===== 商品存在確認 =====
  // ユニークな product_id の一覧を取得する
  const uniqueProductIds = [...new Set(body.items.map(i => i.product_id))];

  try {
    const products = await getProductsByIds(uniqueProductIds);

    // DBから取得できた件数がユニークなproduct_id数と一致しなければ404を返す
    if (products.length !== uniqueProductIds.length) {
      // 存在しないproduct_idを特定する
      const foundIds = new Set(products.map(p => p.id));
      const missingIds = uniqueProductIds.filter(id => !foundIds.has(id));
      res.status(404).json({
        error: 'Product not found',
        details: missingIds.map(id => `product_id: ${id}`),
      });
      return;
    }

    // ===== 合計金額計算 =====
    // DBから取得した price を使って小計・合計を計算する
    const productMap = new Map(products.map(p => [p.id, p]));
    let totalAmount = 0;
    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    // ===== 注文をトランザクションで作成する =====
    const order = await createOrderWithItems(
      body.customer_name,
      body.customer_address,
      body.customer_email,
      totalAmount,
      body.items,
      products
    );

    res.status(201).json({
      order: {
        id:             order.id,
        order_number:   order.order_number,
        customer_name:  order.customer_name,
        customer_email: order.customer_email,
        total_amount:   order.total_amount,
        created_at:     order.created_at,
      },
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/orders/:id
 * 指定IDの注文詳細（明細含む）を取得して返す
 */
export async function getOrderById_controller(req: Request, res: Response): Promise<void> {
  // IDを数値に変換してバリデーションする
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid order id' });
    return;
  }

  try {
    const order = await getOrderById(id);
    if (order === undefined) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const items = await getOrderItemsByOrderId(id);

    res.status(200).json({
      order: {
        id:               order.id,
        order_number:     order.order_number,
        customer_name:    order.customer_name,
        customer_address: order.customer_address,
        customer_email:   order.customer_email,
        total_amount:     order.total_amount,
        created_at:       order.created_at,
        items: items.map(item => ({
          product_id: item.product_id,
          title:      item.title,
          price:      item.price,
          quantity:   item.quantity,
          subtotal:   item.subtotal,
        })),
      },
    });
  } catch (err) {
    console.error('getOrderById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
