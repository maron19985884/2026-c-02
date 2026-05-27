# システム設計書
## 個人運営オンライン書店（購買フロー特化版）

**作成日：** 2026-05-27
**技術スタック：** Next.js 14 (App Router) + TypeScript / Node.js + Express + TypeScript / JSONファイル / Docker

---

## 1. データモデル定義

### 1-1. エンティティ一覧

| エンティティ | 説明 | 永続化場所 |
|---|---|---|
| `Book` | 販売中の書籍情報 | `backend/src/data/books.json` |
| `Order` | 確定済み注文のヘッダー情報 | `backend/src/data/orders.json` |
| `OrderItem` | 注文に紐づく各商品明細（`Order` に内包） | `backend/src/data/orders.json` |
| `CartItem` | カート内の一時的な選択情報 | クライアント側（React Context + localStorage）|

> **注:** `CartItem` はサーバーに永続化しない。注文確定時に `OrderItem` に変換してサーバーへ送信する。

---

### 1-2. Book

```typescript
interface Book {
  id: string;          // UUID v4
  title: string;       // 書籍タイトル
  author: string;      // 著者名
  price: number;       // 税込価格（円）
  description: string; // 書籍説明文
  coverImageUrl: string; // 書影画像パス（例: "/images/books/xxx.jpg"）
  createdAt: string;   // ISO 8601（例: "2026-01-15T00:00:00Z"）
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ○ | 一意識別子（UUID v4） |
| `title` | `string` | ○ | 書籍タイトル |
| `author` | `string` | ○ | 著者名 |
| `price` | `number` | ○ | 税込価格（整数、単位：円） |
| `description` | `string` | ○ | 書籍説明文 |
| `coverImageUrl` | `string` | ○ | 書影画像のURL（frontendのpublic配下を参照） |
| `createdAt` | `string` | ○ | レコード作成日時（ISO 8601） |

---

### 1-3. CartItem

```typescript
interface CartItem {
  bookId: string;   // Book.id への参照
  quantity: number; // 数量（1以上の整数）
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `bookId` | `string` | ○ | `Book.id` への参照 |
| `quantity` | `number` | ○ | 数量（1以上の整数） |

---

### 1-4. Order

```typescript
interface Order {
  orderId: string;       // 注文番号（例: "ORD-20260527-000001"）
  customerName: string;  // 氏名
  address: string;       // 住所
  email: string;         // メールアドレス
  items: OrderItem[];    // 注文明細リスト
  totalAmount: number;   // 合計金額（円）
  createdAt: string;     // ISO 8601
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `orderId` | `string` | ○ | 注文番号。フォーマット: `ORD-YYYYMMDD-NNNNNN`（6桁連番） |
| `customerName` | `string` | ○ | 注文者氏名 |
| `address` | `string` | ○ | 配送先住所 |
| `email` | `string` | ○ | 連絡先メールアドレス |
| `items` | `OrderItem[]` | ○ | 注文明細リスト（1件以上） |
| `totalAmount` | `number` | ○ | 全明細の小計合計（円） |
| `createdAt` | `string` | ○ | 注文確定日時（ISO 8601） |

---

### 1-5. OrderItem

```typescript
interface OrderItem {
  bookId: string;   // Book.id への参照（注文時点のスナップショット）
  title: string;    // 書籍タイトル（注文時点のスナップショット）
  price: number;    // 単価（注文時点のスナップショット）
  quantity: number; // 数量
  subtotal: number; // 小計 = price × quantity
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `bookId` | `string` | ○ | `Book.id` への参照 |
| `title` | `string` | ○ | 注文時点の書籍タイトル（価格変更対応のためスナップショット保持） |
| `price` | `number` | ○ | 注文時点の単価 |
| `quantity` | `number` | ○ | 数量（1以上の整数） |
| `subtotal` | `number` | ○ | 小計（`price × quantity`、サーバー側で計算・検証） |

---

## 2. REST APIエンドポイント一覧

### 共通仕様

| 項目 | 内容 |
|---|---|
| ベースURL | `http://localhost:3001/api` |
| Content-Type | `application/json` |
| 文字コード | UTF-8 |
| エラーレスポンス共通形式 | `{ "error": "メッセージ" }` |

---

### 2-1. 書籍一覧取得

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| パス | `/api/books` |
| 概要 | 販売中の全書籍を取得する |

**リクエスト**
```
GET /api/books
```
（リクエストボディなし）

**レスポンス（200 OK）**
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

**エラーレスポンス（500 Internal Server Error）**
```json
{ "error": "書籍データの読み込みに失敗しました" }
```

---

### 2-2. 書籍詳細取得

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| パス | `/api/books/:id` |
| 概要 | 指定IDの書籍詳細を取得する |

**リクエスト**
```
GET /api/books/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```
（リクエストボディなし）

**レスポンス（200 OK）**
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

**エラーレスポンス（404 Not Found）**
```json
{ "error": "指定された書籍が見つかりません" }
```

---

### 2-3. 注文確定

| 項目 | 内容 |
|---|---|
| メソッド | `POST` |
| パス | `/api/orders` |
| 概要 | 注文を確定し、注文番号を発番してJSONファイルに保存する |

**リクエスト**
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

| フィールド | 型 | 必須 | バリデーション |
|---|---|---|---|
| `customerName` | `string` | ○ | 1文字以上 |
| `address` | `string` | ○ | 1文字以上 |
| `email` | `string` | ○ | RFC 5322準拠のメール形式 |
| `items` | `array` | ○ | 1件以上 |
| `items[].bookId` | `string` | ○ | 存在する `Book.id` であること |
| `items[].quantity` | `number` | ○ | 1以上の整数 |

**レスポンス（201 Created）**
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
  "createdAt": "2026-05-27T08:30:00Z"
}
```

**エラーレスポンス（400 Bad Request）**
```json
{ "error": "customerName は必須です" }
```

**エラーレスポンス（404 Not Found）**
```json
{ "error": "bookId 'xxxx' の書籍が見つかりません" }
```

**エラーレスポンス（500 Internal Server Error）**
```json
{ "error": "注文の保存に失敗しました" }
```

> **サーバー側処理の仕様：**
> 1. リクエストのバリデーション
> 2. `bookId` から書籍情報を参照し、`OrderItem` のスナップショットを生成
> 3. `totalAmount` をサーバー側で計算（クライアント送信値は使用しない）
> 4. `orders.json` の既存件数から連番を発番し `orderId` を生成
> 5. `orders.json` にレコードを追記して保存
> 6. 保存した `Order` オブジェクト全体を返却

---

## 3. 画面とAPIの対応表

| 画面 | 画面パス | 使用APIエンドポイント | タイミング |
|---|---|---|---|
| 商品一覧 | `/` | `GET /api/books` | ページ初期表示時（SSR or CSR） |
| 商品詳細 | `/books/[id]` | `GET /api/books/:id` | ページ初期表示時（SSR） |
| カート | `/cart` | なし（クライアント側のみで完結） | — |
| 注文フォーム | `/checkout` | `POST /api/orders` | 「注文する」ボタン押下時 |
| 注文完了 | `/order-complete` | なし（注文フォームのレスポンスを引き継ぐ） | — |

### 補足

- **商品一覧・詳細:** Next.js の `fetch` を使いサーバーコンポーネントで取得することでSEO・初期表示を最適化する
- **カート:** `CartContext`（React Context API）で状態管理し `localStorage` に永続化する。APIコールは不要
- **注文フォーム→注文完了:** `POST /api/orders` のレスポンス（`orderId` 等）を Next.js の router.push + 状態経由で注文完了画面に渡す

---

## 4. ディレクトリ構成案

```
project-root/
├── docker-compose.yml
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── public/
│   │   └── images/
│   │       └── books/              # 書影画像置き場
│   └── src/
│       ├── app/                    # App Router ルート
│       │   ├── layout.tsx          # ルートレイアウト（Header共通配置）
│       │   ├── page.tsx            # 画面1: 商品一覧
│       │   ├── books/
│       │   │   └── [id]/
│       │   │       └── page.tsx    # 画面2: 商品詳細
│       │   ├── cart/
│       │   │   └── page.tsx        # 画面3: カート
│       │   ├── checkout/
│       │   │   └── page.tsx        # 画面4: 注文フォーム
│       │   └── order-complete/
│       │       └── page.tsx        # 画面5: 注文完了
│       ├── components/
│       │   ├── Header.tsx          # サイト共通ヘッダー（カートアイコン含む）
│       │   ├── BookCard.tsx        # 商品一覧用カードコンポーネント
│       │   ├── CartItemRow.tsx     # カート内1行コンポーネント
│       │   └── OrderSummary.tsx    # 注文フォーム内の注文内容確認コンポーネント
│       ├── context/
│       │   └── CartContext.tsx     # カート状態管理（Context + localStorage）
│       ├── hooks/
│       │   └── useCart.ts          # CartContext を利用するカスタムフック
│       ├── lib/
│       │   └── api.ts              # バックエンドAPIコール関数群
│       └── types/
│           └── index.ts            # Book / CartItem / Order / OrderItem 型定義
│
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                # Expressサーバー起動・ミドルウェア設定
        ├── routes/
        │   ├── books.ts            # GET /api/books, GET /api/books/:id のルーティング
        │   └── orders.ts           # POST /api/orders のルーティング
        ├── controllers/
        │   ├── booksController.ts  # 書籍取得ロジック
        │   └── ordersController.ts # 注文バリデーション・連番発番・保存ロジック
        ├── data/
        │   ├── books.json          # 書籍マスターデータ（手動メンテ）
        │   └── orders.json         # 注文データ永続化ファイル（初期値: []）
        ├── types/
        │   └── index.ts            # Book / Order / OrderItem 型定義
        └── utils/
            └── fileStore.ts        # JSONファイルの読み書きユーティリティ
```

### 各ファイルの役割補足

| ファイル | 役割 |
|---|---|
| `frontend/src/lib/api.ts` | `fetch` ラッパー。baseURL切り替え（Docker環境変数対応）を一元管理 |
| `frontend/src/context/CartContext.tsx` | `add` / `remove` / `updateQuantity` / `clear` アクションを提供 |
| `backend/src/utils/fileStore.ts` | `readJson<T>` / `writeJson<T>` を提供。ファイルI/Oを集約することで排他制御の変更に対応しやすくする |
| `backend/src/data/orders.json` | 初期値は `[]`。注文確定のたびに配列末尾にレコードを追加して上書き保存 |

---

## 5. 注文番号発番ルール

| 項目 | 内容 |
|---|---|
| フォーマット | `ORD-YYYYMMDD-NNNNNN` |
| `YYYYMMDD` | 注文確定日（サーバー時刻、UTC） |
| `NNNNNN` | `orders.json` の全件数 + 1 を6桁ゼロ埋め（例: `000001`） |
| 例 | `ORD-20260527-000001` |

> 同一日付での連番リセットは行わない。全期間通じた通番とすることで `orderId` のユニーク性を保証する。
