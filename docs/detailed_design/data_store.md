# 詳細設計書：JSONファイルの構造と CRUD 操作仕様

**対象ファイル:**
- `backend/src/data/books.json`
- `backend/src/data/orders.json`
- `backend/src/utils/fileStore.ts`

---

## 1. books.json — 書籍マスターデータ

### 1-1. ファイル概要

| 項目 | 内容 |
|---|---|
| パス | `backend/src/data/books.json` |
| 役割 | 販売中の書籍マスターデータを保持する |
| 操作 | 読み取り専用（アプリケーションからの書き込みなし。手動メンテナンス） |
| 初期値 | サンプルデータを含む配列（空配列でも動作可） |

### 1-2. JSON 構造

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "TypeScriptで学ぶ設計原則",
    "author": "山田 太郎",
    "price": 2800,
    "description": "TypeScriptを用いてSOLID原則を実践的に解説する入門書。",
    "coverImageUrl": "/images/books/typescript-design.jpg",
    "createdAt": "2026-01-15T00:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "title": "Reactフロントエンド実践ガイド",
    "author": "鈴木 花子",
    "price": 3200,
    "description": "React 18とNext.jsを使ったモダンフロントエンド開発の全手法を網羅。",
    "coverImageUrl": "/images/books/react-guide.jpg",
    "createdAt": "2026-02-01T00:00:00Z"
  }
]
```

### 1-3. フィールド制約

| フィールド | 型 | NULL可 | 一意性 | 備考 |
|---|---|---|---|---|
| `id` | `string` | × | ○（UUID v4） | `crypto.randomUUID()` 等で事前生成して手動設定 |
| `title` | `string` | × | — | |
| `author` | `string` | × | — | |
| `price` | `number` | × | — | 0以上の整数（税込） |
| `description` | `string` | × | — | 改行は `\n` で表現可 |
| `coverImageUrl` | `string` | × | — | `frontend/public/` 配下の絶対パス |
| `createdAt` | `string` | × | — | ISO 8601 形式 |

### 1-4. CRUD 操作

| 操作 | 実施主体 | 実装 |
|---|---|---|
| CREATE | 手動（ファイル直接編集） | アプリケーションは関与しない |
| READ | `booksController` | `readJson<Book[]>('books.json')` |
| UPDATE | 手動（ファイル直接編集） | アプリケーションは関与しない |
| DELETE | 手動（ファイル直接編集） | アプリケーションは関与しない |

---

## 2. orders.json — 注文データ

### 2-1. ファイル概要

| 項目 | 内容 |
|---|---|
| パス | `backend/src/data/orders.json` |
| 役割 | 確定済み注文を永続化する |
| 操作 | 読み取り（発番時）＋追記（注文確定時） |
| 初期値 | `[]`（空配列） |

### 2-2. JSON 構造

```json
[
  {
    "orderId": "ORD-20260527-000001",
    "customerName": "佐藤 次郎",
    "address": "東京都渋谷区道玄坂1-2-3 サンプルビル4F",
    "email": "jiro.sato@example.com",
    "items": [
      {
        "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "TypeScriptで学ぶ設計原則",
        "price": 2800,
        "quantity": 2,
        "subtotal": 5600
      },
      {
        "bookId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "title": "Reactフロントエンド実践ガイド",
        "price": 3200,
        "quantity": 1,
        "subtotal": 3200
      }
    ],
    "totalAmount": 8800,
    "createdAt": "2026-05-27T08:30:00.000Z"
  }
]
```

### 2-3. フィールド制約

| フィールド | 型 | NULL可 | 一意性 | 備考 |
|---|---|---|---|---|
| `orderId` | `string` | × | ○ | `ORD-YYYYMMDD-NNNNNN` 形式 |
| `customerName` | `string` | × | — | `trim()` 適用済み |
| `address` | `string` | × | — | `trim()` 適用済み |
| `email` | `string` | × | — | `trim()` 適用済み |
| `items` | `OrderItem[]` | × | — | 要素数1以上 |
| `items[].bookId` | `string` | × | — | `books.json` 内 ID のスナップショット |
| `items[].title` | `string` | × | — | 注文時点のスナップショット |
| `items[].price` | `number` | × | — | 注文時点のスナップショット |
| `items[].quantity` | `number` | × | — | 1以上の整数 |
| `items[].subtotal` | `number` | × | — | `price × quantity`（サーバー計算済み） |
| `totalAmount` | `number` | × | — | `Σ subtotal`（サーバー計算済み） |
| `createdAt` | `string` | × | — | ISO 8601 形式 |

### 2-4. CRUD 操作

| 操作 | 実施主体 | 実装 |
|---|---|---|
| CREATE | `ordersController.create` | 既存配列を読み込み → 末尾に追加 → 全体を上書き保存 |
| READ（発番用） | `ordersController.create` | `readJson<Order[]>('orders.json')` で件数を取得し連番を計算 |
| UPDATE | なし（スコープ外） | — |
| DELETE | なし（スコープ外） | — |

---

## 3. fileStore.ts — ファイル I/O ユーティリティ

### 3-1. 概要

JSON ファイルの読み書きを一元管理するモジュール。`fs/promises` を使用して非同期に操作する。

**ファイルパス解決:** すべてのファイル名は `backend/src/data/` ディレクトリからの相対パスとして扱う。

### 3-2. 関数仕様

#### `readJson<T>(filename: string): Promise<T>`

| 項目 | 内容 |
|---|---|
| 説明 | 指定ファイルを読み込み、JSON パースして返す |
| 引数 | `filename`: `data/` ディレクトリ内のファイル名（例: `'books.json'`） |
| 戻り値 | パースされた型 `T` のオブジェクト |
| 例外 | ファイル不存在・権限エラー・JSON パースエラーをそのままスロー |

#### `writeJson<T>(filename: string, data: T): Promise<void>`

| 項目 | 内容 |
|---|---|
| 説明 | 指定ファイルに `data` を JSON シリアライズして書き込む（上書き） |
| 引数 | `filename`: `data/` ディレクトリ内のファイル名、`data`: 書き込むデータ |
| 戻り値 | `void` |
| フォーマット | インデント2スペース（人間が読みやすいよう `JSON.stringify(data, null, 2)` を使用） |
| 例外 | 書き込み権限エラー等をそのままスロー |

### 3-3. 実装コード

```typescript
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../data');

export async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

### 3-4. エラー挙動

| エラー種別 | 発生ケース | 呼び出し側での対処 |
|---|---|---|
| `ENOENT` (No such file) | ファイルが存在しない | コントローラーで catch → 500 レスポンス |
| `EACCES` (Permission denied) | ファイル権限不足 | コントローラーで catch → 500 レスポンス |
| `SyntaxError` | JSON パース失敗 | コントローラーで catch → 500 レスポンス |
| 書き込み失敗 | ディスク満杯・権限不足 | コントローラーで catch → 500 レスポンス |

### 3-5. 同時書き込みに関する注意事項

本実装は **排他制御なし** の設計とする。ローカル Docker 環境での単一ユーザー利用を前提とするため、並行リクエストによる `orders.json` の競合は発生しない想定とする。将来的にスケールが必要な場合は `proper-lockfile` 等の排他制御ライブラリへの差し替えを `fileStore.ts` のみで対応できる設計とする。

---

## 4. index.ts（Expressサーバー起動設定）

### 4-1. 実装コード

```typescript
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

### 4-2. 環境変数

| 変数名 | デフォルト値 | 説明 |
|---|---|---|
| `PORT` | `3001` | サーバーがリッスンするポート番号 |
| `FRONTEND_URL` | `http://localhost:3000` | CORS 許可オリジン（フロントエンドのURL） |
