import request from 'supertest';
import express from 'express';
import ordersRouter from './orders';
import pool from '../db';

jest.mock('../db');
const mockPool = pool as jest.Mocked<typeof pool>;

const app = express();
app.use(express.json());
app.use('/orders', ordersRouter);

const validOrder = {
  customer_name: '山田太郎',
  address: '東京都千代田区1-1-1',
  email: 'yamada@example.com',
  items: [{ book_id: 1, quantity: 2 }],
};

describe('POST /orders', () => {
  beforeEach(() => {
    // トランザクション用のコネクションをモック
    const mockConn = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 1, price: 3200 }], []])  // 書籍価格の取得
        .mockResolvedValueOnce([{ insertId: 1 }, []])            // orders INSERT
        .mockResolvedValueOnce([{}, []]),                        // order_items INSERT
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    mockPool.getConnection.mockResolvedValue(mockConn as any);
  });

  it('注文を作成して注文番号を返す', async () => {
    const res = await request(app).post('/orders').send(validOrder);

    expect(res.status).toBe(201);
    expect(res.body.order_number).toMatch(/^ORD-\d{8}-[A-Z0-9]{6}$/);
    expect(res.body.total_amount).toBe(6400); // 3200 × 2
  });

  it('必須項目が不足している場合は400を返す', async () => {
    const res = await request(app).post('/orders').send({
      customer_name: '山田太郎',
      // address と email と items が欠落
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('必須項目が不足しています');
  });

  it('itemsが空の場合は400を返す', async () => {
    const res = await request(app).post('/orders').send({
      ...validOrder,
      items: [],
    });

    expect(res.status).toBe(400);
  });
});
