import request from 'supertest';
import app from '../app';
import pool from '../db';

afterAll(async () => {
  await pool.end();
});

const validOrder = {
  customer_name: 'テスト 太郎',
  customer_address: '東京都テスト区1-2-3',
  customer_email: 'test@example.com',
  items: [
    { book_id: 1, quantity: 1, unit_price: 4840 },
  ],
};

describe('POST /api/orders', () => {
  it('正常な注文を作成できる', async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    expect(res.status).toBe(201);
    expect(res.body.error).toBeNull();
    expect(res.body.data.id).toBeGreaterThan(0);
    expect(res.body.data.total_amount).toBe(4840);
  });

  it('複数商品の合計金額が正しい', async () => {
    const res = await request(app).post('/api/orders').send({
      ...validOrder,
      items: [
        { book_id: 1, quantity: 2, unit_price: 4840 },
        { book_id: 2, quantity: 1, unit_price: 2640 },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.total_amount).toBe(4840 * 2 + 2640);
  });

  it('氏名が空の場合は 400', async () => {
    const res = await request(app).post('/api/orders').send({ ...validOrder, customer_name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).not.toBeNull();
  });

  it('住所が空の場合は 400', async () => {
    const res = await request(app).post('/api/orders').send({ ...validOrder, customer_address: '' });
    expect(res.status).toBe(400);
  });

  it('メール形式が不正の場合は 400', async () => {
    const res = await request(app).post('/api/orders').send({ ...validOrder, customer_email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('商品リストが空の場合は 400', async () => {
    const res = await request(app).post('/api/orders').send({ ...validOrder, items: [] });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders/:id', () => {
  it('作成した注文を取得できる', async () => {
    const createRes = await request(app).post('/api/orders').send(validOrder);
    const orderId = createRes.body.data.id;

    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items[0].title).toBeTruthy();
  });

  it('存在しない注文は 404', async () => {
    const res = await request(app).get('/api/orders/99999');
    expect(res.status).toBe(404);
  });
});
