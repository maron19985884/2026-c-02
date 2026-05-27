import request from 'supertest';
import app from '../../app';
import { readJson } from '../../utils/fileStore';
import type { Book } from '../../types';

jest.mock('../../utils/fileStore');

const mockReadJson = readJson as jest.MockedFunction<typeof readJson>;

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
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    title: 'Reactフロントエンド実践ガイド',
    author: '鈴木 花子',
    price: 3200,
    description: 'React 18とNext.jsを使ったモダンフロントエンド開発の全手法を網羅。',
    coverImageUrl: '/images/books/react-guide.jpg',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('GET /api/books', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('書籍配列が返ること', async () => {
    mockReadJson.mockResolvedValue(mockBooks);

    const res = await request(app).get('/api/books');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(mockBooks);
  });
});

describe('GET /api/books/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('存在するIDで書籍オブジェクトが返ること', async () => {
    mockReadJson.mockResolvedValue(mockBooks);

    const res = await request(app).get('/api/books/a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockBooks[0]);
    expect(res.body.id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('存在しないIDで404が返ること', async () => {
    mockReadJson.mockResolvedValue(mockBooks);

    const res = await request(app).get('/api/books/nonexistent-id-0000-0000');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });
});
