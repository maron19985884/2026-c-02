import request from 'supertest';
import app from '../../app';
import { readJson, writeJson } from '../../utils/fileStore';
import type { Book, Order } from '../../types';

jest.mock('../../utils/fileStore');

const mockReadJson = readJson as jest.MockedFunction<typeof readJson>;
const mockWriteJson = writeJson as jest.MockedFunction<typeof writeJson>;

const mockBooks: Book[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'TypeScriptで学ぶ設計原則',
    author: '山田 太郎',
    price: 2800,
    description: 'TypeScriptを用いてSOLID原則を実践的に解説する入門書。',
    coverImageUrl: '/images/books/typescript-design.jpg',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

const validOrderPayload = {
  customerName: 'テスト 太郎',
  address: '東京都渋谷区テスト1-1-1',
  email: 'test@example.com',
  items: [{ bookId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 }],
};

describe('POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteJson.mockResolvedValue(undefined);
  });

  describe('正常系', () => {
    it('正常データで201と注文オブジェクト（orderId含む）が返ること', async () => {
      mockReadJson
        .mockResolvedValueOnce(mockBooks as any)
        .mockResolvedValueOnce([] as any);

      const res = await request(app).post('/api/orders').send(validOrderPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('orderId');
      expect(res.body.orderId).toMatch(/^ORD-\d{8}-\d{6}$/);
      expect(res.body.customerName).toBe('テスト 太郎');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.totalAmount).toBe(5600); // 2800 * 2
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].subtotal).toBe(5600);
    });

    it('注文番号採番: 既存0件 → 末尾が000001', async () => {
      mockReadJson
        .mockResolvedValueOnce(mockBooks as any)
        .mockResolvedValueOnce([] as any);

      const res = await request(app).post('/api/orders').send(validOrderPayload);

      expect(res.status).toBe(201);
      expect(res.body.orderId).toMatch(/-000001$/);
    });

    it('注文番号採番: 既存2件 → 末尾が000003', async () => {
      const existingOrders: Partial<Order>[] = [
        { orderId: 'ORD-20260101-000001' },
        { orderId: 'ORD-20260101-000002' },
      ];
      mockReadJson
        .mockResolvedValueOnce(mockBooks as any)
        .mockResolvedValueOnce(existingOrders as any);

      const res = await request(app).post('/api/orders').send(validOrderPayload);

      expect(res.status).toBe(201);
      expect(res.body.orderId).toMatch(/-000003$/);
    });
  });

  describe('バリデーションエラー（400）', () => {
    it('customerName欠損で400が返ること', async () => {
      const { customerName: _cn, ...payload } = validOrderPayload;
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('address欠損で400が返ること', async () => {
      const { address: _addr, ...payload } = validOrderPayload;
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('email欠損で400が返ること', async () => {
      const { email: _email, ...payload } = validOrderPayload;
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('email形式不正で400が返ること', async () => {
      const payload = { ...validOrderPayload, email: 'invalid-email-format' };
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('items空配列で400が返ること', async () => {
      const payload = { ...validOrderPayload, items: [] };
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('items欠損で400が返ること', async () => {
      const { items: _items, ...payload } = validOrderPayload;
      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
