# Data Model: 購買フロー全体（5画面）

**Feature**: 001-purchase-flow
**Date**: 2026-06-28

## DBエンティティ（MySQL）

### books テーブル（既存）

販売対象の書籍情報。このフィーチャーでは参照のみ（書き込みはスコープ外）。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 内部ID |
| title | VARCHAR(255) | NOT NULL | 書籍タイトル |
| author | VARCHAR(255) | NOT NULL | 著者名 |
| price | INT | NOT NULL | 税込価格（円） |
| description | TEXT | NULL | 書籍説明文 |
| image_url | VARCHAR(500) | NULL | 書影画像URL |

### orders テーブル

注文確定時に生成される注文レコード。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 内部ID |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | システム発行の一意な注文番号 |
| customer_name | VARCHAR(255) | NOT NULL | 顧客氏名 |
| customer_address | TEXT | NOT NULL | 顧客住所 |
| customer_email | VARCHAR(255) | NOT NULL | 顧客メールアドレス |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 注文確定日時 |

### order_items テーブル

注文に含まれる書籍の明細。単価は注文時点の価格を保持する。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 内部ID |
| order_id | INT | NOT NULL, FK → orders.id | 親注文のID |
| book_id | INT | NOT NULL, FK → books.id | 書籍のID |
| quantity | INT | NOT NULL, CHECK (quantity > 0) | 注文数量 |
| unit_price | INT | NOT NULL | 注文時点の単価（税込・円） |

## フロントエンドエンティティ（クライアントサイド）

### CartItem（カートアイテム）

React Context で管理。DBへの永続化なし（セッション単位）。

```typescript
interface CartItem {
  bookId: number;
  title: string;
  author: string;
  unitPrice: number;  // 税込価格（円）
  quantity: number;   // 1以上の整数
}
```

### Cart（カート集計）

CartItem[] から算出する派生値。

```typescript
interface CartSummary {
  items: CartItem[];
  totalAmount: number;  // items の小計合算（送料除く）
}
```

## リレーション

```text
books 1 ──< order_items >── orders
```

- 1つの注文（orders）は1つ以上の注文アイテム（order_items）を持つ
- 注文アイテムは書籍（books）を参照する

## DDL（参考）

```sql
CREATE TABLE books (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  price       INT          NOT NULL,
  description TEXT,
  image_url   VARCHAR(500)
);

CREATE TABLE orders (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(50)  NOT NULL UNIQUE,
  customer_name    VARCHAR(255) NOT NULL,
  customer_address TEXT         NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  book_id     INT NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  unit_price  INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (book_id)  REFERENCES books(id)
);
```
