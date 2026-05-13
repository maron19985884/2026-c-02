// Books API 結合テスト
// 前提: Docker Compose でサービスが起動済みであること（docker-compose up -d）

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const api = axios.create({ baseURL: BASE_URL });

describe('Books API 結合テスト', () => {
  describe('GET /api/books - 書籍一覧取得', () => {
    test('[IT-BK-01] ステータス200で書籍一覧を取得できる', async () => {
      const res = await api.get('/api/books');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    test('[IT-BK-02] レスポンスの書籍オブジェクトに必要なフィールドが含まれる', async () => {
      const res = await api.get('/api/books');
      const book = res.data[0];

      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
      expect(book).toHaveProperty('price');
      expect(typeof book.id).toBe('number');
      expect(typeof book.title).toBe('string');
      expect(typeof book.price).toBe('number');
    });
  });

  describe('GET /api/books/:id - 書籍詳細取得', () => {
    test('[IT-BK-03] 存在する書籍（id=1）をステータス200で取得できる', async () => {
      const res = await api.get('/api/books/1');

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(1);
      expect(res.data).toHaveProperty('title');
      expect(res.data).toHaveProperty('author');
      expect(res.data).toHaveProperty('price');
    });

    test('[IT-BK-04] 存在しない書籍（id=99999）は404を返す', async () => {
      await expect(api.get('/api/books/99999')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    test('[IT-BK-05] 不正なID（文字列"abc"）は400を返す', async () => {
      await expect(api.get('/api/books/abc')).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });
});
