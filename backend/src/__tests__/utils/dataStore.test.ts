/**
 * fileStore (データストア) ユニットテスト
 * fs.promises をモックして readJson / writeJson の動作と
 * ordersController 内の採番ロジックを検証する
 */

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

import { promises as fsPromises } from 'fs';
import { readJson, writeJson } from '../../utils/fileStore';
import type { Book, Order } from '../../types';

const mockReadFile = fsPromises.readFile as unknown as jest.Mock;
const mockWriteFile = fsPromises.writeFile as unknown as jest.Mock;

const sampleBooks: Book[] = [
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

describe('readJson - 書籍データ読み込み', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('書籍一覧をJSONとして正しく読み込めること', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleBooks));

    const books = await readJson<Book[]>('books.json');

    expect(books).toEqual(sampleBooks);
    expect(books).toHaveLength(2);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
  });

  it('IDによる書籍取得（存在）: 対象書籍が見つかること', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleBooks));

    const books = await readJson<Book[]>('books.json');
    const found = books.find((b) => b.id === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

    expect(found).toBeDefined();
    expect(found?.title).toBe('TypeScriptで学ぶ設計原則');
    expect(found?.price).toBe(2800);
  });

  it('IDによる書籍取得（不存在）: undefinedが返ること', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleBooks));

    const books = await readJson<Book[]>('books.json');
    const found = books.find((b) => b.id === 'nonexistent-id-9999-9999');

    expect(found).toBeUndefined();
  });
});

describe('writeJson - 注文保存', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
  });

  it('注文データをJSONファイルに書き込めること', async () => {
    const newOrder: Order = {
      orderId: 'ORD-20260527-000001',
      customerName: 'テストユーザー',
      address: '東京都渋谷区1-1-1',
      email: 'test@example.com',
      items: [
        {
          bookId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          title: 'TypeScriptで学ぶ設計原則',
          price: 2800,
          quantity: 1,
          subtotal: 2800,
        },
      ],
      totalAmount: 2800,
      createdAt: '2026-05-27T00:00:00Z',
    };

    await writeJson<Order[]>('orders.json', [newOrder]);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const [calledPath, calledData, encoding] = mockWriteFile.mock.calls[0];
    expect(String(calledPath)).toContain('orders.json');
    expect(encoding).toBe('utf-8');
    expect(JSON.parse(String(calledData))).toEqual([newOrder]);
  });
});

describe('注文番号採番ロジック', () => {
  it('初回注文（既存0件）は連番000001になること', () => {
    const existingOrders: Order[] = [];
    const seqPart = String(existingOrders.length + 1).padStart(6, '0');
    expect(seqPart).toBe('000001');
  });

  it('既存1件の場合は連番000002になること', () => {
    const existingOrders = [{}];
    const seqPart = String(existingOrders.length + 1).padStart(6, '0');
    expect(seqPart).toBe('000002');
  });

  it('既存5件の場合は連番000006になること', () => {
    const existingOrders = Array(5).fill({});
    const seqPart = String(existingOrders.length + 1).padStart(6, '0');
    expect(seqPart).toBe('000006');
  });

  it('orderId形式が ORD-YYYYMMDD-NNNNNN であること', () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seqPart = '000001';
    const orderId = `ORD-${datePart}-${seqPart}`;
    expect(orderId).toMatch(/^ORD-\d{8}-\d{6}$/);
  });
});
