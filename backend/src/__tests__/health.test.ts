import request from 'supertest';
import app from '../app';
import pool from '../db';

afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  it('DB 接続状態を返す', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.db).toBe('connected');
  });
});
