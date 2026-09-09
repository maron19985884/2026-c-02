# Data Model: 注文フォーム画面

## CustomerInfo（顧客情報、入力値）

注文フォーム画面で購入希望者が入力する情報。バックエンドへの送信前にフロントエンドで`validateOrderForm`によりバリデーションする（FR-001〜FR-005）。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| name | string | ✓ | 氏名。1つの入力欄（姓・名の分割なし、spec.md Clarifications） |
| address | string | ✓ | 住所。自由記述の1つの入力欄（spec.md Clarifications） |
| email | string | ✓ | メールアドレス。「ローカル部@ドメイン部」の一般的な形式チェック対象（FR-004） |

### バリデーション・不変条件

- 3項目とも空文字（前後の空白のみを含む場合も空とみなす）は不可（FR-002, FR-003）。
- `email`は`xxx@yyy`形式（ローカル部・ドメイン部ともに1文字以上、`@`を1つだけ含む）を満たさない場合は不正とする（FR-004）。具体的な正規表現は実装フェーズで定める。
- バリデーションは「注文する」ボタン押下時にまとめて実施する（spec.md Assumptions）。

## Order（注文、確定後・永続化対象）

`POST /api/orders`が成功した際にバックエンドが生成し、MySQLの`orders`テーブルに保存する。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | number | ✓ | 注文を一意に識別する内部ID（`AUTO_INCREMENT`） |
| orderNumber | string | ✓ | 注文番号。ULID風・Base32・26文字。購入希望者に提示される識別子（要件定義書§7、`research.md` D-01） |
| customerName | string | ✓ | 確定時点の氏名（`CustomerInfo.name`をそのまま保存） |
| customerAddress | string | ✓ | 確定時点の住所 |
| customerEmail | string | ✓ | 確定時点のメールアドレス |
| totalAmount | number | ✓ | 注文全体の合計金額（円）。サーバー側で`OrderItem`の小計を合算して算出（改ざん防止、`research.md` D-02） |
| createdAt | string (ISO 8601) | ✓ | 注文確定日時 |

### バリデーション・不変条件

- `orderNumber`は一意（DB制約: `UNIQUE`）。
- `totalAmount`は`OrderItem`群の`subtotal`の総和と一致する（サーバー側で算出するため不整合は発生しない）。
- 注文は最低1件以上の`OrderItem`を持つ（空のカートからは注文を作成できない、FR-012）。

## OrderItem（注文明細、確定後・永続化対象）

注文確定時点の`CartItem`（`005-book-detail-page`で定義）の内容をスナップショットしたもの。カート内容が後から変わっても、確定済みの注文明細は影響を受けない。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | number | ✓ | 明細行を一意に識別する内部ID |
| orderId | number | ✓ | 所属する`Order.id`への参照 |
| bookId | number | ✓ | 対象書籍の`Book.id`への参照（`004-book-list-page`で定義） |
| bookTitle | string | ✓ | 確定時点の書名スナップショット（サーバー側で`books`テーブルから再取得、`research.md` D-02） |
| unitPrice | number | ✓ | 確定時点の単価スナップショット（サーバー側で再取得） |
| quantity | number | ✓ | 数量（カート画面での数量をそのまま引き継ぐ） |
| subtotal | number | ✓ | `unitPrice * quantity`。サーバー側で算出して保存 |

### バリデーション・不変条件

- `quantity`は1以上の整数。
- `bookId`は注文作成時点で`books`テーブルに存在する必要がある（存在しない場合はAPIが400を返し、注文全体を作成しない）。
- `unitPrice`・`bookTitle`はクライアントから送信された値を採用せず、必ずサーバー側で`books`テーブルを参照して決定する（`research.md` D-02）。

## テーブル定義（MySQL、`mysql/init/02_orders.sql`）

```sql
CREATE TABLE IF NOT EXISTS orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_number      VARCHAR(26) NOT NULL UNIQUE,
  customer_name     VARCHAR(255) NOT NULL,
  customer_address  VARCHAR(512) NOT NULL,
  customer_email    VARCHAR(255) NOT NULL,
  total_amount      INT NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  book_id     INT NOT NULL,
  book_title  VARCHAR(255) NOT NULL,
  unit_price  INT NOT NULL,
  quantity    INT NOT NULL,
  subtotal    INT NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_book FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- 命名規則はtech-stack.md §7「DBテーブル名・カラム名: snake_case（複数形テーブル）」に準拠。
- `books`テーブル（`004-book-list-page`の`data-model.md`で定義済み）への変更はない。

## 状態・関係

- 本機能は`CustomerInfo`（入力・バリデーション）→`Order` / `OrderItem`（確定・永続化）の生成のみを扱う。`Order` / `OrderItem`の参照・表示（注文完了画面での注文番号表示等）は今後の機能（REQ-016〜018）のスコープ。
- `Order` / `OrderItem`は`006-cart-page`で定義済みの`CartItem`（フロントエンド・`localStorage`のみ）から、注文確定時に1回限り変換される。変換後、フロントエンドの`CartContext`は`clearCart()`により空になる（`research.md` D-05）。
