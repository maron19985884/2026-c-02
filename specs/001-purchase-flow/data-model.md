# Data Model: オンライン書店 購買フロー

**Feature**: specs/001-purchase-flow
**Date**: 2026-06-30

---

## エンティティ一覧

| Entity | 役割 | 永続化 |
|--------|------|--------|
| Book | 販売書籍 | MySQL (`books` テーブル) |
| CartItem | カートの1行（書籍 + 数量） | クライアント (localStorage) |
| Order | 確定した注文 | MySQL (`orders` テーブル) |
| OrderItem | 注文に含まれる書籍1行 | MySQL (`order_items` テーブル) |

---

## 1. Book（書籍）

### スキーマ設計

```sql
CREATE TABLE books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  author      VARCHAR(255)  NOT NULL,
  price       INT           NOT NULL,  -- 円単位（整数）
  description TEXT          NOT NULL,
  image_url   VARCHAR(500)  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| title | NOT NULL、最大255文字 |
| author | NOT NULL、最大255文字 |
| price | NOT NULL、1以上の整数（円） |
| description | NOT NULL |
| image_url | NOT NULL、最大500文字 |

### TypeScript型

```typescript
export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;       // 円単位
  description: string;
  imageUrl: string;
}
```

---

## 2. CartItem（カートアイテム）

クライアントサイドのみ（localStorage）。サーバーには保存しない。

### TypeScript型

```typescript
export interface CartItem {
  book: Book;
  quantity: number;    // 1以上
}

export interface Cart {
  items: CartItem[];
}
```

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| quantity | 1以上の整数（0以下への変更は削除と同等） |
| items | 同一書籍の重複追加時は quantity を加算する |

---

## 3. Order（注文）

### スキーマ設計

```sql
CREATE TABLE orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  order_number   VARCHAR(20)   NOT NULL UNIQUE,  -- "ORD-XXXXXX" 形式
  customer_name  VARCHAR(255)  NOT NULL,
  address        TEXT          NOT NULL,
  email          VARCHAR(255)  NOT NULL,
  total_amount   INT           NOT NULL,  -- 円単位（整数）
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| order_number | UNIQUE、"ORD-" + 6桁ゼロ埋め整数（例: ORD-000001） |
| customer_name | NOT NULL、最大255文字 |
| address | NOT NULL |
| email | NOT NULL、RFC5322簡易チェック（@を含む形式） |
| total_amount | NOT NULL、1以上の整数 |

### order_number の生成ルール

`orders.id` の AUTO_INCREMENT 値を使って `ORD-` + 6桁ゼロ埋めで生成。  
例：id=1 → `ORD-000001`、id=42 → `ORD-000042`

### TypeScript型

```typescript
export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  address: string;
  email: string;
  totalAmount: number;
  createdAt: string;   // ISO 8601
}
```

---

## 4. OrderItem（注文明細）

### スキーマ設計

```sql
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  book_id     INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  INT NOT NULL,  -- 注文時点の価格スナップショット（円単位）
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_book  FOREIGN KEY (book_id)  REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| order_id | NOT NULL、orders.id への外部キー |
| book_id | NOT NULL、books.id への外部キー |
| quantity | 1以上の整数 |
| unit_price | 注文確定時の価格（books.price のスナップショット）。price 変更の影響を受けない |

### TypeScript型

```typescript
export interface OrderItem {
  id: number;
  orderId: number;
  bookId: number;
  quantity: number;
  unitPrice: number;
}
```

---

## エンティティ関係図

```
books          order_items        orders
┌──────────┐   ┌─────────────┐   ┌──────────────────┐
│ id  (PK) │◄──│ book_id     │   │ id  (PK)         │
│ title    │   │ order_id  ──┼──►│ order_number      │
│ author   │   │ quantity    │   │ customer_name     │
│ price    │   │ unit_price  │   │ address           │
│ desc...  │   └─────────────┘   │ email             │
│ image_url│                     │ total_amount      │
└──────────┘                     └──────────────────┘

CartItem（クライアントのみ）
┌─────────────────┐
│ book: Book      │  ← books テーブルから取得した Book オブジェクト
│ quantity: number│
└─────────────────┘
```

---

## シードデータ方針

- `mysql/init/` に SQL ファイルを追加してシードデータを投入
- 最低5冊の書籍データ（title, author, price, description, image_url）を用意
- image_url は `https://placehold.jp/150x200.png` 等のプレースホルダーを使用
- 詳細は `/speckit-tasks` および実装フェーズで定義
