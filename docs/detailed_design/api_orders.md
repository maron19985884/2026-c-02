# 詳細設計書：注文関連API
## POST /api/orders

**対象ファイル:**
- `backend/src/routes/orders.ts`
- `backend/src/controllers/ordersController.ts`

---

## 1. POST /api/orders — 注文確定

### 1-1. エンドポイント

| 項目 | 内容 |
|---|---|
| HTTPメソッド | `POST` |
| パス | `/api/orders` |
| 説明 | 注文情報を受け取り、バリデーション・書籍情報補完・合計計算・連番発番を行い `orders.json` に保存する。保存した `Order` オブジェクト全体を返す |
| 認証 | 不要 |
| Content-Type（リクエスト） | `application/json; charset=utf-8` |
| Content-Type（レスポンス） | `application/json; charset=utf-8` |

### 1-2. リクエスト形式

**ヘッダー**

| ヘッダー名 | 値 | 必須 |
|---|---|---|
| `Content-Type` | `application/json` | ○ |

**パスパラメータ**

なし

**クエリパラメータ**

なし

**リクエストボディ（JSON）**

```json
{
  "customerName": "佐藤 次郎",
  "address": "東京都渋谷区道玄坂1-2-3 サンプルビル4F",
  "email": "jiro.sato@example.com",
  "items": [
    {
      "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "quantity": 2
    },
    {
      "bookId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "quantity": 1
    }
  ]
}
```

**リクエストボディ フィールド定義**

| フィールド | 型 | 必須 | 制約 |
|---|---|---|---|
| `customerName` | `string` | ○ | 空文字・空白のみ不可 |
| `address` | `string` | ○ | 空文字・空白のみ不可 |
| `email` | `string` | ○ | RFC 5322 準拠のメール形式（正規表現: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`） |
| `items` | `array` | ○ | 要素数1以上 |
| `items[].bookId` | `string` | ○ | `books.json` に存在する `Book.id` |
| `items[].quantity` | `number` | ○ | 1以上の整数 |

### 1-3. レスポンス形式

**成功（201 Created）**
```json
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
```

**エラー（400 Bad Request）— バリデーション失敗**

```json
{ "error": "customerName は必須です" }
```

```json
{ "error": "email の形式が正しくありません" }
```

```json
{ "error": "items は1件以上必要です" }
```

```json
{ "error": "quantity は1以上の整数である必要があります" }
```

**エラー（404 Not Found）— 存在しない bookId が含まれる**

```json
{ "error": "bookId 'xxxx-xxxx-xxxx' の書籍が見つかりません" }
```

**エラー（500 Internal Server Error）— ファイル読み書き失敗**

```json
{ "error": "注文の保存に失敗しました" }
```

### 1-4. バリデーションルールと対応エラーコード

バリデーションは上から順に実施し、最初に検出したエラーを返す（複数エラーの一括返却はしない）。

| # | チェック対象 | ルール | エラーコード | エラーメッセージ |
|---|---|---|---|---|
| 1 | `customerName` | フィールド存在かつ `trim()` 後1文字以上 | `400` | `"customerName は必須です"` |
| 2 | `address` | フィールド存在かつ `trim()` 後1文字以上 | `400` | `"address は必須です"` |
| 3 | `email` | フィールド存在かつ `trim()` 後1文字以上 | `400` | `"email は必須です"` |
| 4 | `email` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` にマッチ | `400` | `"email の形式が正しくありません"` |
| 5 | `items` | 配列かつ要素数1以上 | `400` | `"items は1件以上必要です"` |
| 6 | `items[i].bookId` | 文字列かつ空でない | `400` | `"bookId は必須です"` |
| 7 | `items[i].quantity` | 整数かつ1以上 | `400` | `"quantity は1以上の整数である必要があります"` |
| 8 | `items[i].bookId` | `books.json` 内に存在する | `404` | `"bookId '{bookId}' の書籍が見つかりません"` |

> チェック #8 は全入力値の構造バリデーション（#1〜#7）が通過した後に実施する。

### 1-5. 処理フロー

```
1. Express Router が POST /api/orders を受信する
2. ordersController.create(req, res) を呼び出す

3. リクエストボディのバリデーション（#1〜#7）を実施する
   └─ エラーあり → 400 エラーを返してリターン

4. fileStore.readJson<Book[]>('books.json') で書籍データを読み込む
   └─ 失敗 → 500 エラーを返してリターン

5. items 配列の各要素に対して bookId で書籍を検索する（#8）
   └─ 1件でも見つからない → 404 エラーを返してリターン

6. OrderItem[] を生成する
   items.map(item => ({
     bookId: item.bookId,
     title: book.title,            // books.json のスナップショット
     price: book.price,            // books.json のスナップショット
     quantity: item.quantity,
     subtotal: book.price * item.quantity   // サーバー側で計算
   }))

7. totalAmount を計算する
   orderItems.reduce((sum, i) => sum + i.subtotal, 0)

8. fileStore.readJson<Order[]>('orders.json') で既存注文を読み込む
   └─ 失敗 → 500 エラーを返してリターン

9. orderId を発番する
   フォーマット: "ORD-YYYYMMDD-NNNNNN"
   - YYYYMMDD: new Date().toISOString() の日付部分（UTC）
   - NNNNNN: (orders.length + 1) をゼロ埋め6桁

10. Order オブジェクトを組み立てる
    {
      orderId,
      customerName: req.body.customerName.trim(),
      address: req.body.address.trim(),
      email: req.body.email.trim(),
      items: orderItems,
      totalAmount,
      createdAt: new Date().toISOString()
    }

11. orders 配列の末尾に追加し fileStore.writeJson('orders.json', orders) で保存する
    └─ 失敗 → 500 エラーを返してリターン

12. res.status(201).json(newOrder) で 201 Created を返す
```

---

## 2. 注文番号（orderId）発番ルール

| 要素 | 内容 |
|---|---|
| フォーマット | `ORD-YYYYMMDD-NNNNNN` |
| `YYYYMMDD` | `new Date().toISOString().slice(0, 10).replace(/-/g, '')` |
| `NNNNNN` | `String(orders.length + 1).padStart(6, '0')` |
| 例 | `ORD-20260527-000001` |

```typescript
const now = new Date();
const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // "20260527"
const seqPart = String(orders.length + 1).padStart(6, '0');        // "000001"
const orderId = `ORD-${datePart}-${seqPart}`;
```

---

## 3. 実装コード

### routes/orders.ts

```typescript
import { Router } from 'express';
import { create } from '../controllers/ordersController';

const router = Router();

router.post('/', create);

export default router;
```

### controllers/ordersController.ts

```typescript
import { Request, Response } from 'express';
import { readJson, writeJson } from '../utils/fileStore';
import type { Book, Order, OrderItem, CreateOrderRequest } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequest(body: CreateOrderRequest): string | null {
  if (!body.customerName?.trim()) return 'customerName は必須です';
  if (!body.address?.trim()) return 'address は必須です';
  if (!body.email?.trim()) return 'email は必須です';
  if (!EMAIL_REGEX.test(body.email.trim())) return 'email の形式が正しくありません';
  if (!Array.isArray(body.items) || body.items.length === 0) return 'items は1件以上必要です';
  for (const item of body.items) {
    if (!item.bookId?.trim()) return 'bookId は必須です';
    if (!Number.isInteger(item.quantity) || item.quantity < 1)
      return 'quantity は1以上の整数である必要があります';
  }
  return null;
}

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateOrderRequest;

  const validationError = validateRequest(body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  let books: Book[];
  try {
    books = await readJson<Book[]>('books.json');
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  const orderItems: OrderItem[] = [];
  for (const item of body.items) {
    const book = books.find((b) => b.id === item.bookId);
    if (!book) {
      res.status(404).json({ error: `bookId '${item.bookId}' の書籍が見つかりません` });
      return;
    }
    orderItems.push({
      bookId: item.bookId,
      title: book.title,
      price: book.price,
      quantity: item.quantity,
      subtotal: book.price * item.quantity,
    });
  }

  const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

  let orders: Order[];
  try {
    orders = await readJson<Order[]>('orders.json');
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seqPart = String(orders.length + 1).padStart(6, '0');
  const orderId = `ORD-${datePart}-${seqPart}`;

  const newOrder: Order = {
    orderId,
    customerName: body.customerName.trim(),
    address: body.address.trim(),
    email: body.email.trim(),
    items: orderItems,
    totalAmount,
    createdAt: new Date().toISOString(),
  };

  try {
    await writeJson<Order[]>('orders.json', [...orders, newOrder]);
  } catch {
    res.status(500).json({ error: '注文の保存に失敗しました' });
    return;
  }

  res.status(201).json(newOrder);
};
```

### index.ts への登録（抜粋）

```typescript
import ordersRouter from './routes/orders';
app.use('/api/orders', ordersRouter);
```
