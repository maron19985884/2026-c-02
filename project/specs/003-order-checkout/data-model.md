# Data Model: 注文フォームと注文確定処理

**Feature**: 003-order-checkout
**Date**: 2026-06-28

## エンティティ

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

注文に含まれる書籍の明細レコード。単価は注文時点の価格を保持する（後日の価格変動の影響を受けない）。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 内部ID |
| order_id | INT | NOT NULL, FK → orders.id | 親注文のID |
| book_id | INT | NOT NULL, FK → books.id | 書籍のID |
| quantity | INT | NOT NULL, CHECK (quantity > 0) | 注文数量 |
| unit_price | INT | NOT NULL | 注文時点の単価（税込・円、0より大きい整数） |

## リレーション

```text
orders 1 ──< order_items >── books
```

- 1つの注文（orders）は1つ以上の注文アイテム（order_items）を持つ
- 注文アイテムは書籍（books）を参照する（booksテーブルは既存）

## バリデーションルール

| フィールド | ルール |
|---|---|
| customer_name | 必須・空文字不可 |
| customer_address | 必須・空文字不可 |
| customer_email | 必須・メール形式（`@` を含む標準的なメール形式） |
| order_number | システム採番・重複不可 |
| items | 1件以上が必須 |
| items[].quantity | 1以上の整数 |
| items[].unit_price | 0より大きい整数 |

## 状態遷移

注文エンティティは「確定」のみ。キャンセル・変更・返品はスコープ外のため状態管理は不要。

## DDL（参考）

```sql
CREATE TABLE orders (
  id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number  VARCHAR(50)  NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT      NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
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
