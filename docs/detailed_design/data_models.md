# 詳細設計書：TypeScript 型定義・インターフェース一覧

**対象ファイル:**
- `backend/src/types/index.ts`
- `frontend/src/types/index.ts`

---

## 1. バックエンド型定義（`backend/src/types/index.ts`）

### 1-1. Book

```typescript
/** 書籍マスターデータ（books.json の1要素） */
export interface Book {
  /** 一意識別子（UUID v4） */
  id: string;
  /** 書籍タイトル */
  title: string;
  /** 著者名 */
  author: string;
  /** 税込価格（円、整数） */
  price: number;
  /** 書籍説明文 */
  description: string;
  /** 書影画像パス（frontend の public 配下への相対パス。例: "/images/books/xxx.jpg"） */
  coverImageUrl: string;
  /** レコード作成日時（ISO 8601） */
  createdAt: string;
}
```

### 1-2. OrderItem

```typescript
/** 注文明細（Order に内包。注文時点の書籍情報スナップショットを保持） */
export interface OrderItem {
  /** Book.id への参照 */
  bookId: string;
  /** 注文時点の書籍タイトル（価格変更後も注文時の値を保持） */
  title: string;
  /** 注文時点の単価（円） */
  price: number;
  /** 数量（1以上の整数） */
  quantity: number;
  /** 小計 = price × quantity（サーバー側で計算） */
  subtotal: number;
}
```

### 1-3. Order

```typescript
/** 確定済み注文（orders.json の1要素） */
export interface Order {
  /** 注文番号（フォーマット: "ORD-YYYYMMDD-NNNNNN"） */
  orderId: string;
  /** 注文者氏名 */
  customerName: string;
  /** 配送先住所 */
  address: string;
  /** 連絡先メールアドレス */
  email: string;
  /** 注文明細リスト（1件以上） */
  items: OrderItem[];
  /** 合計金額（円） = Σ OrderItem.subtotal（サーバー側で計算） */
  totalAmount: number;
  /** 注文確定日時（ISO 8601） */
  createdAt: string;
}
```

### 1-4. リクエスト型

```typescript
/** POST /api/orders のリクエストボディ型 */
export interface CreateOrderRequest {
  customerName: string;
  address: string;
  email: string;
  items: CreateOrderItemRequest[];
}

/** CreateOrderRequest.items の各要素 */
export interface CreateOrderItemRequest {
  bookId: string;
  quantity: number;
}
```

### 1-5. エラーレスポンス型

```typescript
/** API エラーレスポンスの共通形式 */
export interface ApiErrorResponse {
  error: string;
}
```

---

## 2. フロントエンド型定義（`frontend/src/types/index.ts`）

### 2-1. Book（バックエンドと同一定義）

```typescript
/** 書籍情報（API レスポンスおよびコンポーネント props に使用） */
export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  coverImageUrl: string;
  createdAt: string;
}
```

### 2-2. CartItem

```typescript
/**
 * カート内アイテム（CartContext で管理・localStorage に永続化）
 * カート表示に必要な書籍情報スナップショットを含む。
 * 「カートに追加」時点の price で小計を計算する。
 */
export interface CartItem {
  bookId: string;
  quantity: number;
  /** 「カートに追加」時点の書籍情報スナップショット */
  snapshot: BookSnapshot;
}

/** CartItem に埋め込む書籍情報（価格・表示に必要な最小セット） */
export interface BookSnapshot {
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}
```

### 2-3. OrderItem（バックエンドと同一定義）

```typescript
/** 注文明細（POST /api/orders のレスポンスに含まれる） */
export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
}
```

### 2-4. Order（バックエンドと同一定義）

```typescript
/** 確定済み注文（POST /api/orders のレスポンス全体） */
export interface Order {
  orderId: string;
  customerName: string;
  address: string;
  email: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}
```

### 2-5. API 呼び出し用リクエスト型

```typescript
/** POST /api/orders に送信するリクエストボディ */
export interface CreateOrderPayload {
  customerName: string;
  address: string;
  email: string;
  items: { bookId: string; quantity: number }[];
}
```

### 2-6. CartContext 型

```typescript
/** CartContext が提供する状態と操作 */
export interface CartContextValue {
  /** カート内アイテム一覧 */
  items: CartItem[];
  /** カート内の総冊数（Σ quantity） */
  totalCount: number;
  /** カート内の合計金額（Σ snapshot.price × quantity） */
  totalAmount: number;
  /**
   * カートにアイテムを追加する。
   * 同じ bookId が既に存在する場合は quantity を +1 する。
   */
  add: (bookId: string, snapshot: BookSnapshot) => void;
  /** アイテムの数量を更新する */
  updateQuantity: (bookId: string, quantity: number) => void;
  /** アイテムをカートから削除する */
  remove: (bookId: string) => void;
  /** カートを空にする（注文確定後に呼び出す） */
  clear: () => void;
}
```

### 2-7. 注文フォーム用型

```typescript
/** 注文フォームの入力値を管理する state の型 */
export interface OrderFormValues {
  customerName: string;
  address: string;
  email: string;
}

/** 注文フォームのバリデーションエラーを管理する state の型 */
export interface OrderFormErrors {
  customerName?: string;
  address?: string;
  email?: string;
}
```

### 2-8. sessionStorage に保存する注文完了データ型

```typescript
/** sessionStorage キー "lastOrder" に保存する注文完了データ */
export interface LastOrderData {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}
```

---

## 3. 型の使用箇所マッピング

| 型名 | バックエンドでの使用箇所 | フロントエンドでの使用箇所 |
|---|---|---|
| `Book` | `booksController.ts`, `ordersController.ts` | `api.ts`, `BookCard.tsx`, `page.tsx`（一覧・詳細） |
| `Order` | `ordersController.ts`, `orders.json` | `api.ts`, `checkout/page.tsx`, `order-complete/page.tsx` |
| `OrderItem` | `ordersController.ts`, `orders.json` | `OrderSummary.tsx`, `order-complete/page.tsx` |
| `CartItem` | — | `CartContext.tsx`, `cart/page.tsx`, `CartItemRow.tsx` |
| `BookSnapshot` | — | `CartContext.tsx`, `CartItemRow.tsx` |
| `CartContextValue` | — | `CartContext.tsx`, `useCart.ts` |
| `CreateOrderPayload` | — | `api.ts`, `checkout/page.tsx` |
| `OrderFormValues` | — | `checkout/page.tsx` |
| `OrderFormErrors` | — | `checkout/page.tsx` |
| `LastOrderData` | — | `checkout/page.tsx`, `order-complete/page.tsx` |
