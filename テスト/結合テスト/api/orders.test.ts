// Orders API 結合テスト
// 前提: Docker Compose でサービスが起動済みであること（docker-compose up -d）

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

describe('Orders API 結合テスト', () => {
  describe('POST /api/orders - 注文作成', () => {
    test('[IT-ORD-01] 有効なデータで注文を作成できる（ステータス201）', async () => {
      const res = await api.post('/api/orders', {
        customer_name: '山田太郎',
        customer_email: 'yamada.taro@example.com',
        customer_address: '東京都渋谷区1-1-1',
        items: [{ book_id: 1, quantity: 1 }],
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('order_number');
      expect(res.data).toHaveProperty('total_amount');
      expect(res.data.order_number).toMatch(/^ORD-\d{14}-\d{4}$/);
      expect(typeof res.data.total_amount).toBe('number');
      expect(res.data.total_amount).toBeGreaterThan(0);
    });

    test('[IT-ORD-02] 氏名が空の場合ステータス400とエラーメッセージ「氏名は必須です」', async () => {
      await expect(
        api.post('/api/orders', {
          customer_name: '',
          customer_email: 'test@example.com',
          customer_address: '東京都渋谷区1-1-1',
          items: [{ book_id: 1, quantity: 1 }],
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: '氏名は必須です' },
        },
      });
    });

    test('[IT-ORD-03] 不正なメールアドレスの場合ステータス400とエラーメッセージ', async () => {
      await expect(
        api.post('/api/orders', {
          customer_name: '山田太郎',
          customer_email: 'invalid-email',
          customer_address: '東京都渋谷区1-1-1',
          items: [{ book_id: 1, quantity: 1 }],
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: '有効なメールアドレスを入力してください' },
        },
      });
    });

    test('[IT-ORD-04] 住所が空の場合ステータス400とエラーメッセージ「住所は必須です」', async () => {
      await expect(
        api.post('/api/orders', {
          customer_name: '山田太郎',
          customer_email: 'test@example.com',
          customer_address: '',
          items: [{ book_id: 1, quantity: 1 }],
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: '住所は必須です' },
        },
      });
    });

    test('[IT-ORD-05] 商品が空配列の場合ステータス400とエラーメッセージ「注文商品が空です」', async () => {
      await expect(
        api.post('/api/orders', {
          customer_name: '山田太郎',
          customer_email: 'test@example.com',
          customer_address: '東京都渋谷区1-1-1',
          items: [],
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: '注文商品が空です' },
        },
      });
    });

    test('[IT-ORD-06] 存在しない書籍ID（99999）の場合ステータス500を返す', async () => {
      await expect(
        api.post('/api/orders', {
          customer_name: '山田太郎',
          customer_email: 'test@example.com',
          customer_address: '東京都渋谷区1-1-1',
          items: [{ book_id: 99999, quantity: 1 }],
        })
      ).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });

  describe('GET /api/orders/:id - 注文詳細取得', () => {
    let createdOrderId: number;
    let book1Price: number;
    let book2Price: number;

    beforeAll(async () => {
      const booksRes = await api.get('/api/books');
      const books: { id: number; price: number }[] = booksRes.data;
      book1Price = books.find((b) => b.id === 1)?.price ?? 0;
      book2Price = books.find((b) => b.id === 2)?.price ?? 0;

      const res = await api.post('/api/orders', {
        customer_name: '結合テスト ユーザー',
        customer_email: 'integration-test@example.com',
        customer_address: '東京都テスト区テスト町1-1-1',
        items: [
          { book_id: 1, quantity: 2 },
          { book_id: 2, quantity: 1 },
        ],
      });
      createdOrderId = res.data.id;
    });

    test('[IT-ORD-07] 作成した注文をIDで取得できる', async () => {
      const res = await api.get(`/api/orders/${createdOrderId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(createdOrderId);
      expect(res.data.customer_name).toBe('結合テスト ユーザー');
    });

    test('[IT-ORD-08] レスポンスに注文明細（items）が含まれる（2件）', async () => {
      const res = await api.get(`/api/orders/${createdOrderId}`);

      expect(Array.isArray(res.data.items)).toBe(true);
      expect(res.data.items).toHaveLength(2);
    });

    test('[IT-ORD-09] 合計金額がDBの書籍価格×数量と一致する', async () => {
      const res = await api.get(`/api/orders/${createdOrderId}`);
      const expectedTotal = book1Price * 2 + book2Price * 1;

      expect(res.data.total_amount).toBe(expectedTotal);
    });

    test('[IT-ORD-10] 存在しない注文（id=99999）は404を返す', async () => {
      await expect(api.get('/api/orders/99999')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    test('[IT-ORD-11] 不正なID（文字列"abc"）は400を返す', async () => {
      await expect(api.get('/api/orders/abc')).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });
});
