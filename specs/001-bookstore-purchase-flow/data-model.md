# Phase 1 Data Model: 個人運営オンライン書店（購買フロー特化版）

spec.mdの Key Entities（書籍・カート・カート明細・注文）を、research.mdの決定（SQLite、カートはフロントエンド保持）に基づき具体化する。

## Book（書籍）

DBテーブル `books` として永続化。管理画面がないため、シードデータとしてのみ投入・更新される（アプリ経由での作成・更新APIは持たない）。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| id | INTEGER (PK, AUTOINCREMENT) | ○ | 書籍ID |
| title | TEXT | ○ | タイトル |
| author | TEXT | ○ | 著者 |
| price | INTEGER | ○ | 価格（円、税込） |
| description | TEXT | ○ | 説明文（商品詳細画面用） |
| image_url | TEXT | ○ | 書影画像URL |

バリデーション: price は 0 より大きい整数。

## CartItem（カート明細・フロントエンド状態のみ）

SQLiteには永続化しない。`frontend/src/contexts` 内でのみ保持する。

| フィールド | 型 | 説明 |
|---|---|---|
| bookId | number | 対象書籍のID（Bookを参照） |
| quantity | number | 数量（下限1、上限なし。spec.md FR-022） |

派生値: `subtotal = book.price * quantity`

## Cart（カート・フロントエンド状態のみ）

| フィールド | 型 | 説明 |
|---|---|---|
| items | CartItem[] | カート内明細の配列。同一bookIdは1件に集約する（spec.md FR-021） |

派生値: `totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)`

## Order（注文）

DBテーブル `orders` として永続化。`POST /api/orders` 実行時にのみ作成される（更新・削除APIは持たない）。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| id | INTEGER (PK, AUTOINCREMENT) | ○ | 内部ID |
| order_number | TEXT (UNIQUE) | ○ | 画面表示用の注文番号（research.md: `ORD-YYYYMMDD-NNNN`） |
| customer_name | TEXT | ○ | 氏名（spec.md FR-012） |
| address | TEXT | ○ | 住所（spec.md FR-012） |
| email | TEXT | ○ | メールアドレス（形式検証あり。spec.md FR-013） |
| total_amount | INTEGER | ○ | 注文確定時点の合計金額 |
| created_at | TEXT (ISO8601) | ○ | 注文日時 |

バリデーション:
- customer_name, address, email はすべて必須（空文字不可）
- email は `local-part@domain` 形式であること

## OrderItem（注文明細）

DBテーブル `order_items` として永続化。注文確定時点の書籍情報（タイトル・単価）をスナップショットとして保持し、後から書籍のシードデータが変わっても過去の注文内容が変化しないようにする。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| id | INTEGER (PK, AUTOINCREMENT) | ○ | 内部ID |
| order_id | INTEGER (FK → orders.id) | ○ | どの注文の明細か |
| book_id | INTEGER (FK → books.id) | ○ | 対象書籍 |
| title | TEXT | ○ | 注文確定時点の書籍タイトル（スナップショット） |
| price | INTEGER | ○ | 注文確定時点の単価（スナップショット） |
| quantity | INTEGER | ○ | 数量 |
| subtotal | INTEGER | ○ | `price * quantity` |

## リレーション

```
Book (1) ── (0..n) OrderItem (n..1) ── (1) Order
```

- 1つのOrderは1件以上のOrderItemを持つ（空カートでは注文できない。spec.md FR-020）
- OrderItemはBookを参照するが、表示用の内容（title, price）は注文時点でスナップショットとして複製する
