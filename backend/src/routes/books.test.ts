import request from 'supertest';
import express from 'express';
import booksRouter from './books';
import pool from '../db';

// DBをモックに差し替え
jest.mock('../db');
const mockPool = pool as jest.Mocked<typeof pool>;

const app = express();
app.use(express.json());
app.use('/books', booksRouter);

const sampleBooks = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', price: 3200, description: '...', image_url: 'http://example.com/1.jpg' },
  { id: 2, title: 'リーダブルコード', author: 'Dustin Boswell', price: 2640, description: '...', image_url: 'http://example.com/2.jpg' },
];

describe('GET /books', () => {
  it('書籍一覧を返す', async () => {
    mockPool.query.mockResolvedValueOnce([sampleBooks, []] as any);

    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Clean Code');
  });
});

describe('GET /books/:id', () => {
  it('指定したIDの書籍を返す', async () => {
    mockPool.query.mockResolvedValueOnce([[sampleBooks[0]], []] as any);

    const res = await request(app).get('/books/1');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Clean Code');
  });

  it('存在しないIDの場合は404を返す', async () => {
    mockPool.query.mockResolvedValueOnce([[], []] as any);

    const res = await request(app).get('/books/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('書籍が見つかりません');
  });
});
