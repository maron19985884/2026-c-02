# Data Model: カート画面

本機能はDBスキーマの追加・変更を行わない。`books`テーブルの定義は`specs/002-book-catalog-detail/data-model.md`を正本とする。

## カート項目（Cart Item、クライアント側概念エンティティ）

サーバー側では永続化しない。保存形態は002で実装済みの`localStorage`（キー: `cart`）を継続利用する。

### 永続化される最小データ（`cartStore`が保持）

| フィールド | 型 | 説明 |
|---|---|---|
| `bookId` | number | 書籍ID（`books.id`を参照） |
| `quantity` | number (>=1) | 数量。1未満にはできない（spec.md FR-009） |

### 画面表示用に合成するデータ（永続化しない）

カート画面表示時に、上記`bookId`と`GET /api/books`のレスポンス（`BookSummary[]`）を突き合わせて、以下を導出する。

| フィールド | 型 | 導出元 |
|---|---|---|
| `title` | string | `BookSummary.title` |
| `price` | number | `BookSummary.price` |
| `coverImageUrl` | string \| null | `BookSummary.coverImageUrl` |
| `subtotal` | number | `price * quantity`（表示のたびに算出、永続化しない） |
| `isAvailable` | boolean | 一覧結果（`GET /api/books`）に該当`bookId`が存在するかどうか。存在しない場合は`false`＝販売対象外（spec.md FR-010） |

## カート合計（Cart Total、算出値）

永続化しない。表示のたびに、`isAvailable === true`のカート項目の`subtotal`を合計して算出する。販売対象外の項目（`isAvailable === false`）は合計に含めない。

| フィールド | 型 | 算出方法 |
|---|---|---|
| `total` | number | `isAvailable`な各カート項目の`subtotal`の総和 |

## 関係

- `cartStore`が保持する`bookId`は概念的に`books.id`を参照するが、外部キー制約はサーバー側に存在しない（カートを保持するテーブル自体が存在しないため。002 data-model.md参照）。
- 表示用データ（`title`/`price`/`isAvailable`等）は画面表示のたびに`GET /api/books`から再取得し、`localStorage`には保存しない。書籍の価格・販売状態が変わった場合も常に最新の状態が表示される。
