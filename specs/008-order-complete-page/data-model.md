# Data Model: 注文完了画面

本機能は新規テーブル・スキーマ変更を行わない。`007-order-form-page`の`data-model.md`で定義済みの`orders`テーブル（`mysql/init/02_orders.sql`）を参照のみで利用する。

## 参照する既存モデル

### orders テーブル（`007`で定義済み、変更なし）

| カラム | 型 | 説明 |
|---|---|---|
| id | INT AUTO_INCREMENT | 内部ID |
| order_number | VARCHAR(26) UNIQUE | 注文番号（本機能の検索キー） |
| customer_name | VARCHAR(255) | 顧客氏名（本機能では取得・表示しない） |
| customer_address | VARCHAR(512) | 顧客住所（本機能では取得・表示しない） |
| customer_email | VARCHAR(255) | メールアドレス（本機能では取得・表示しない） |
| total_amount | INT | 合計金額（本機能では取得・表示しない） |
| created_at | DATETIME | 注文確定日時（本機能では取得・表示しない） |

- `order_number`は`UNIQUE`制約済みのため、`WHERE order_number = ?`の検索は一意な行を高速に特定できる（`research.md` D-01）。
- 本機能のスコープ（REQ-016〜018）は完了メッセージ・注文番号・一覧へ戻るリンクの表示のみであり、`customer_*` / `total_amount` / `created_at`は取得・表示しない（`research.md` D-01、YAGNI）。

## OrderExistence（本機能固有、永続化なし）

`GET /api/orders/:orderNumber`のレスポンス・`orderService.getOrderByNumber`の戻り値として使う、本機能で新設する最小限の型。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| orderNumber | string | ✓ | 検索に使用した注文番号と同一の値（存在確認済みであることの証跡） |

### バリデーション・不変条件

- `orderNumber`に対応する`orders`行が存在しない場合、`orderService.getOrderByNumber`は`null`を返す（例外を投げない）。ルーター（`ordersRouter.ts`）が`null`を`404`レスポンスに変換する（FR-008）。
- URLパスパラメータの`orderNumber`はそのままSQLへ連結せず、`mysql2`のプレースホルダ経由で渡す（tech-stack.md §8）。

## 状態・関係

- `Order` / `OrderItem`の生成（永続化）は`007-order-form-page`のスコープであり、本機能は生成済みの`orders`行を`order_number`で1件検索するだけの読み取り専用機能である。
- カートの状態（`CartItem`、`006-cart-page`で定義）は本機能では扱わない。注文確定成功直後のカートクリアは`007`の実装が担う（`research.md` D-03）。
