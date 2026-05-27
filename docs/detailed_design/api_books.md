# 詳細設計書：書籍関連API
## GET /api/books, GET /api/books/:id

**対象ファイル:**
- `backend/src/routes/books.ts`
- `backend/src/controllers/booksController.ts`

---

## 1. GET /api/books — 書籍一覧取得

### 1-1. エンドポイント

| 項目 | 内容 |
|---|---|
| HTTPメソッド | `GET` |
| パス | `/api/books` |
| 説明 | `books.json` に登録されている全書籍を配列で返す |
| 認証 | 不要 |
| Content-Type（レスポンス） | `application/json; charset=utf-8` |

### 1-2. リクエスト形式

**ヘッダー**

なし（必須ヘッダーなし）

**パスパラメータ**

なし

**クエリパラメータ**

なし（フィルタ・ソート・ページネーションはスコープ外）

**リクエストボディ**

なし

**リクエスト例**
```
GET /api/books HTTP/1.1
Host: localhost:3001
```

### 1-3. レスポンス形式

**成功（200 OK）— 書籍が1件以上の場合**
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

**成功（200 OK）— 書籍が0件の場合**
```json
[]
```

**エラー（500 Internal Server Error）— ファイル読み込み失敗**
```json
{ "error": "書籍データの読み込みに失敗しました" }
```

### 1-4. バリデーションルールと対応エラーコード

入力パラメータなし（GET リクエスト）のため、フロントエンド入力に対するバリデーションは不要。

| チェック内容 | 対応エラーコード | エラーメッセージ |
|---|---|---|
| `books.json` のファイル読み込み失敗（権限不足・ファイル破損等） | `500` | `"書籍データの読み込みに失敗しました"` |

### 1-5. 処理フロー

```
1. Express Router が GET /api/books を受信する
2. booksController.getAll(req, res) を呼び出す
3. fileStore.readJson<Book[]>('books.json') でファイルを読み込む
   ├─ 失敗（例外発生）→ res.status(500).json({ error: "..." }) を返してリターン
   └─ 成功 → books 配列を取得
4. res.json(books) で 200 OK を返す
   （books が空配列 [] の場合も 200 OK で返す）
```

---

## 2. GET /api/books/:id — 書籍詳細取得

### 2-1. エンドポイント

| 項目 | 内容 |
|---|---|
| HTTPメソッド | `GET` |
| パス | `/api/books/:id` |
| 説明 | 指定 ID の書籍を1件返す |
| 認証 | 不要 |
| Content-Type（レスポンス） | `application/json; charset=utf-8` |

### 2-2. リクエスト形式

**パスパラメータ**

| パラメータ名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ○ | `Book.id`（UUID v4 形式） |

**リクエスト例**
```
GET /api/books/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:3001
```

**ヘッダー**

なし（必須ヘッダーなし）

**クエリパラメータ**

なし

**リクエストボディ**

なし

### 2-3. レスポンス形式

**成功（200 OK）**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "TypeScriptで学ぶ設計原則",
  "author": "山田 太郎",
  "price": 2800,
  "description": "TypeScriptを用いてSOLID原則を実践的に解説する入門書。",
  "coverImageUrl": "/images/books/typescript-design.jpg",
  "createdAt": "2026-01-15T00:00:00Z"
}
```

**エラー（404 Not Found）— 指定 ID が存在しない**
```json
{ "error": "指定された書籍が見つかりません" }
```

**エラー（500 Internal Server Error）— ファイル読み込み失敗**
```json
{ "error": "書籍データの読み込みに失敗しました" }
```

### 2-4. バリデーションルールと対応エラーコード

| チェック内容 | 対応エラーコード | エラーメッセージ |
|---|---|---|
| 指定 ID に一致する書籍が存在しない | `404` | `"指定された書籍が見つかりません"` |
| `books.json` のファイル読み込み失敗 | `500` | `"書籍データの読み込みに失敗しました"` |

> ID フォーマット（UUID v4 形式）のバリデーションは行わない。フォーマットが不正でも `find` で該当なしとなり 404 を返す。

### 2-5. 処理フロー

```
1. Express Router が GET /api/books/:id を受信する
2. req.params.id から id を取得する
3. booksController.getById(req, res) を呼び出す
4. fileStore.readJson<Book[]>('books.json') でファイルを読み込む
   ├─ 失敗（例外発生）→ res.status(500).json({ error: "..." }) を返してリターン
   └─ 成功 → books 配列を取得
5. books.find(b => b.id === id) で対象書籍を検索する
   ├─ 見つからない → res.status(404).json({ error: "..." }) を返してリターン
   └─ 見つかった → book オブジェクトを取得
6. res.json(book) で 200 OK を返す
```

---

## 3. 実装コード

### routes/books.ts

```typescript
import { Router } from 'express';
import { getAll, getById } from '../controllers/booksController';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

export default router;
```

### controllers/booksController.ts

```typescript
import { Request, Response } from 'express';
import { readJson } from '../utils/fileStore';
import type { Book } from '../types';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await readJson<Book[]>('books.json');
    res.json(books);
  } catch {
    res.status(500).json({ error: '書籍データの読み込みに失敗しました' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await readJson<Book[]>('books.json');
    const book = books.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: '指定された書籍が見つかりません' });
      return;
    }
    res.json(book);
  } catch {
    res.status(500).json({ error: '書籍データの読み込みに失敗しました' });
  }
};
```

### index.ts への登録（抜粋）

```typescript
import booksRouter from './routes/books';
app.use('/api/books', booksRouter);
```
