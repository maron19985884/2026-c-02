import request from 'supertest';
import app from '../app';
import pool from '../db';

afterAll(async () => {
  await pool.end();
});

describe('GET /api/books', () => {
  it('書籍一覧を返す', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body.error).toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('各書籍に必須フィールドが含まれる', async () => {
    const res = await request(app).get('/api/books');
    const book = res.body.data[0];
    expect(book).toHaveProperty('id');
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('price');
  });
});

describe('GET /api/books/:id', () => {
  it('存在する書籍を返す', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(res.body.data.id).toBe(1);
  });

  it('存在しない書籍は 404', async () => {
    const res = await request(app).get('/api/books/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).not.toBeNull();
  });

  it('無効な id は 400', async () => {
    const res = await request(app).get('/api/books/abc');
    expect(res.status).toBe(400);
  });
});
