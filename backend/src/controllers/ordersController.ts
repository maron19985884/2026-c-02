import { Request, Response } from 'express';
import { z } from 'zod';
import { readJson, writeJson } from '../utils/fileStore';
import type { Book, Order, OrderItem } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const orderItemSchema = z.object({
  bookId: z
    .string({
      required_error: 'bookId は必須です',
      invalid_type_error: 'bookId は必須です',
    })
    .min(1, 'bookId は必須です'),
  quantity: z
    .number({
      required_error: 'quantity は1以上の整数である必要があります',
      invalid_type_error: 'quantity は1以上の整数である必要があります',
    })
    .int('quantity は1以上の整数である必要があります')
    .min(1, 'quantity は1以上の整数である必要があります'),
});

const createOrderSchema = z.object({
  customerName: z
    .string({
      required_error: 'customerName は必須です',
      invalid_type_error: 'customerName は必須です',
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'customerName は必須です' }),
  address: z
    .string({
      required_error: 'address は必須です',
      invalid_type_error: 'address は必須です',
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'address は必須です' }),
  email: z
    .string({
      required_error: 'email は必須です',
      invalid_type_error: 'email は必須です',
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'email は必須です' })
    .refine((v) => EMAIL_REGEX.test(v), { message: 'email の形式が正しくありません' }),
  items: z
    .array(orderItemSchema, {
      required_error: 'items は1件以上必要です',
      invalid_type_error: 'items は1件以上必要です',
    })
    .min(1, 'items は1件以上必要です'),
});

export const create = async (req: Request, res: Response): Promise<void> => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  const { customerName, address, email, items } = result.data;

  let books: Book[];
  try {
    books = await readJson<Book[]>('books.json');
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  const orderItems: OrderItem[] = [];
  for (const item of items) {
    const book = books.find((b) => b.id === item.bookId);
    if (!book) {
      res.status(404).json({ error: `bookId '${item.bookId}' の書籍が見つかりません` });
      return;
    }
    orderItems.push({
      bookId: item.bookId,
      title: book.title,
      price: book.price,
      quantity: item.quantity,
      subtotal: book.price * item.quantity,
    });
  }

  const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

  let orders: Order[];
  try {
    orders = await readJson<Order[]>('orders.json');
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seqPart = String(orders.length + 1).padStart(6, '0');
  const orderId = `ORD-${datePart}-${seqPart}`;

  const newOrder: Order = {
    orderId,
    customerName,
    address,
    email,
    items: orderItems,
    totalAmount,
    createdAt: new Date().toISOString(),
  };

  try {
    await writeJson<Order[]>('orders.json', [...orders, newOrder]);
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  res.status(201).json(newOrder);
};
