# 詳細設計書：フロントエンド API クライアント仕様

**対象ファイル:** `frontend/src/lib/api.ts`

---

## 1. 概要

バックエンドへの全 HTTP リクエストをこのファイルに集約する。各ページ・コンポーネントは `fetch` を直接使わず、このファイルのエクスポート関数を通じて API を呼び出す。

**設計方針:**
- `baseURL` を環境変数（`BACKEND_URL`）から取得し、ローカル開発と Docker 環境を切り替える
- HTTP エラー（4xx / 5xx）は `ApiError` をスローし、呼び出し側で `catch` する
- 全関数は `async/await` ベースで実装する

---

## 2. 共通設定

### 2-1. baseURL

```typescript
const BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
```

### 2-2. カスタムエラークラス

```typescript
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 2-3. 共通リクエストヘルパー

```typescript
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.error === 'string') message = body.error;
    } catch {
      // JSON パース失敗時はデフォルトメッセージを使用
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
```

---

## 3. 関数仕様

### 3-1. fetchBooks

| 項目 | 内容 |
|---|---|
| 関数名 | `fetchBooks` |
| 説明 | 販売中の全書籍一覧を取得する |
| 使用箇所 | `frontend/src/app/page.tsx`（商品一覧画面 SSR） |

**シグネチャ:**
```typescript
export async function fetchBooks(): Promise<Book[]>
```

**内部実装:**
```typescript
export async function fetchBooks(): Promise<Book[]> {
  return request<Book[]>('/api/books', { cache: 'no-store' });
}
```

**fetch オプション:**

| オプション | 値 | 理由 |
|---|---|---|
| `cache` | `'no-store'` | 常に最新の書籍データを取得するため |

**レスポンス:**

| ケース | 戻り値 / 例外 |
|---|---|
| 成功（200） | `Book[]`（空配列の場合もある） |
| サーバーエラー（500） | `ApiError(500, "書籍データの読み込みに失敗しました")` をスロー |
| ネットワークエラー | `TypeError` をスロー（`fetch` が送出する標準エラー） |

---

### 3-2. fetchBook

| 項目 | 内容 |
|---|---|
| 関数名 | `fetchBook` |
| 説明 | 指定 ID の書籍詳細を取得する |
| 使用箇所 | `frontend/src/app/books/[id]/page.tsx`（商品詳細画面 SSR） |

**シグネチャ:**
```typescript
export async function fetchBook(id: string): Promise<Book>
```

**内部実装:**
```typescript
export async function fetchBook(id: string): Promise<Book> {
  return request<Book>(`/api/books/${encodeURIComponent(id)}`, { cache: 'no-store' });
}
```

**fetch オプション:**

| オプション | 値 | 理由 |
|---|---|---|
| `cache` | `'no-store'` | 常に最新データを取得するため |

**レスポンス:**

| ケース | 戻り値 / 例外 |
|---|---|
| 成功（200） | `Book` オブジェクト |
| 書籍が存在しない（404） | `ApiError(404, "指定された書籍が見つかりません")` をスロー |
| サーバーエラー（500） | `ApiError(500, "書籍データの読み込みに失敗しました")` をスロー |
| ネットワークエラー | `TypeError` をスロー |

**呼び出し側での 404 ハンドリング例（`books/[id]/page.tsx`）:**
```typescript
try {
  const book = await fetchBook(params.id);
} catch (e) {
  if (e instanceof ApiError && e.status === 404) notFound();
  throw e; // error.tsx へ伝播
}
```

---

### 3-3. createOrder

| 項目 | 内容 |
|---|---|
| 関数名 | `createOrder` |
| 説明 | 注文を確定する。バリデーション済みのデータをサーバーへ送信し、注文番号を含む `Order` オブジェクトを受け取る |
| 使用箇所 | `frontend/src/app/checkout/page.tsx`（「注文する」ボタン押下時） |

**シグネチャ:**
```typescript
export async function createOrder(payload: CreateOrderPayload): Promise<Order>
```

**引数の型（`CreateOrderPayload`）:**
```typescript
interface CreateOrderPayload {
  customerName: string;
  address: string;
  email: string;
  items: { bookId: string; quantity: number }[];
}
```

**内部実装:**
```typescript
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

**fetch オプション:**

| オプション | 値 | 理由 |
|---|---|---|
| `method` | `'POST'` | 注文作成は冪等でないため POST |
| `body` | `JSON.stringify(payload)` | リクエストボディ |

**リクエストボディ例:**
```json
{
  "customerName": "佐藤 次郎",
  "address": "東京都渋谷区道玄坂1-2-3 サンプルビル4F",
  "email": "jiro.sato@example.com",
  "items": [
    { "bookId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "quantity": 2 },
    { "bookId": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "quantity": 1 }
  ]
}
```

**レスポンス:**

| ケース | 戻り値 / 例外 |
|---|---|
| 成功（201） | `Order` オブジェクト（`orderId`, `items`, `totalAmount`, `createdAt` を含む） |
| バリデーションエラー（400） | `ApiError(400, "<バックエンドのエラーメッセージ>")` をスロー |
| 書籍が見つからない（404） | `ApiError(404, "bookId '...' の書籍が見つかりません")` をスロー |
| サーバーエラー（500） | `ApiError(500, "注文の保存に失敗しました")` をスロー |
| ネットワークエラー | `TypeError` をスロー |

**呼び出し側でのエラーハンドリング例（`checkout/page.tsx`）:**
```typescript
try {
  const order = await createOrder(payload);
  // 成功処理
} catch (e) {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 400:
      case 404:
        setApiError(e.message);
        break;
      case 500:
        setApiError('サーバーエラーが発生しました。しばらくしてから再度お試しください。');
        break;
      default:
        setApiError('予期しないエラーが発生しました。');
    }
  } else {
    setApiError('通信エラーが発生しました。接続を確認してください。');
  }
  setIsSubmitting(false);
}
```

---

## 4. 完全実装コード

```typescript
import type { Book, Order, CreateOrderPayload } from '@/types';

const BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.error === 'string') message = body.error;
    } catch {
      // JSON パース失敗時はデフォルトメッセージを使用
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function fetchBooks(): Promise<Book[]> {
  return request<Book[]>('/api/books', { cache: 'no-store' });
}

export async function fetchBook(id: string): Promise<Book> {
  return request<Book>(`/api/books/${encodeURIComponent(id)}`, { cache: 'no-store' });
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

---

## 5. 関数使用箇所サマリー

| 関数 | 呼び出し元ファイル | 呼び出しタイミング |
|---|---|---|
| `fetchBooks()` | `app/page.tsx` | ページの SSR 時（サーバー側） |
| `fetchBook(id)` | `app/books/[id]/page.tsx` | ページの SSR 時（サーバー側） |
| `createOrder(payload)` | `app/checkout/page.tsx` | 「注文する」ボタン押下時（クライアント側） |

> `fetchBooks` / `fetchBook` はサーバーコンポーネントから呼ばれるため、Node.js の `fetch`（Next.js が拡張したもの）を使用する。`createOrder` はクライアントコンポーネントから呼ばれるため、ブラウザの `fetch` を使用する。どちらも同じ `api.ts` の関数を使用できる。
