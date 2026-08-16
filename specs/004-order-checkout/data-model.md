# Data Model: 注文フォーム・注文完了画面

## Order（注文）

MySQLの`orders`テーブルとして永続化する（作成のみ。更新・削除APIは本機能の対象外）。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT (PK) | ○ | 注文を一意に識別するID。注文番号（`ORD-` + 6桁ゼロ埋め）の採番元（research.md #1） |
| `customer_name` | VARCHAR(255) | ○ | 氏名（自由記述、spec.md Assumptions） |
| `customer_address` | VARCHAR(500) | ○ | 住所（自由記述、spec.md Assumptions） |
| `customer_email` | VARCHAR(255) | ○ | メールアドレス（形式検証済み、research.md #5） |
| `total_amount` | INT | ○ | 合計金額（日本円）。バックエンドが`order_items`から再計算した値（research.md #2） |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | ○ | 注文確定日時 |

**バリデーション/制約**:
- `customer_name` / `customer_address` / `customer_email` はいずれも空文字列不可（spec.md FR-003）。
- `customer_email` は`local@domain`の基本構造を満たすこと（spec.md FR-004、research.md #5）。
- `total_amount` は0以上の整数（`order_items`の`price * quantity`の総和と一致する）。

**状態遷移**: 本機能では状態遷移なし（発送・キャンセル等のステータス管理は対象外、spec.md Assumptions）。

## OrderItem（注文商品）

MySQLの`order_items`テーブルとして永続化する。`Order`に対して1対多。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT (PK) | ○ | 注文商品明細を一意に識別するID |
| `order_id` | INT (FK → `orders.id`) | ○ | どの注文に属するか |
| `book_id` | INT (FK → `books.id`) | ○ | 対象書籍の参照。書籍が後で削除・販売対象外になっても本レコードは変化しない |
| `title` | VARCHAR(255) | ○ | 注文確定時点の書名スナップショット（research.md #2） |
| `price` | INT | ○ | 注文確定時点の単価スナップショット（日本円） |
| `quantity` | INT | ○ | 数量（1以上） |

**バリデーション/制約**:
- `quantity` は1以上の整数（003 spec.md FR-009のカート側制約を踏襲。カート内の数量が1未満になることはない）。
- 1件の注文に紐づく`order_items`は1件以上（空の注文は作成できない、spec.md FR-010）。
- 小計（`price * quantity`の合計）が`orders.total_amount`と一致する。

**関係**: `Order 1 --- N OrderItem`。`OrderItem.book_id`は`books.id`を参照するが、`books`側のレコードが将来変化・削除されても`OrderItem`の`title`/`price`スナップショットには影響しない（外部キー制約は参照整合性のみを目的とし、`ON DELETE CASCADE`は設定しない）。

## カート項目（Cart Item）— 003-cart-managementからの入力

本機能は新しいエンティティを追加しないが、注文フォーム画面の表示・注文確定リクエストの元データとして、003で定義済みの`cartStore`のカート項目（`bookId`, `quantity`）をそのまま利用する（`specs/003-cart-management/data-model.md`参照）。販売対象外と判定された項目（`isAvailable = false`）は注文確定リクエストに含めない。
