# Phase 1: Data Model — オンライン書店の購買フロー

**Branch**: `004-bookstore-purchase-flow` | **Date**: 2026-09-15 | **Plan**: [plan.md](./plan.md)

> 本書は [spec.md](./spec.md) の Key Entities を、[`tech-stack.md`](../../tech-stack.md) §7 の命名規則
> （テーブル・カラムは snake_case、テーブルは複数形）に従って具体化した**中間成果物**である。
> 憲法§7 が定める正式なテーブル定義書（HTML）は `/speckit.design table` で生成する。

---

## 1. エンティティ対応表

| spec.md の Key Entity | 永続化 | 実体 | 備考 |
|---|---|---|---|
| 書籍（Book） | MySQL | `books` テーブル | 初期データとして投入。本フィーチャーからは変更しない（FR-001b） |
| カート（Cart） | **しない** | ブラウザの `localStorage` | サーバに持たない（research.md D-01 / FR-016a） |
| カート明細（Cart Item） | **しない** | `localStorage` 内の配列要素 | 保持するのは `{ bookId, quantity }` のみ |
| 注文（Order） | MySQL | `orders` テーブル | 顧客情報を同テーブルに保持 |
| 注文明細（Order Item） | MySQL | `order_items` テーブル | 注文時点のスナップショット（FR-024） |
| 顧客情報（Customer Info） | MySQL | `orders` の列として保持 | 会員情報ではなく注文単位の情報のため独立テーブルにしない |

---

## 2. ER 関係

```text
books (1) ──────< (0..N) order_items >────── (N) orders (1)
                        │
                        └─ book_id は参照のみ。表示は必ずスナップショット列を使う

localStorage（サーバ外）
└─ cart: [{ bookId, quantity }, ...]   ← books.id を参照するが DB 上の関連は持たない
```

- `orders` : `order_items` = 1 : N（注文は1件以上の明細を持つ）
- `books` : `order_items` = 1 : 0..N（書籍は複数の注文に現れうる）

---

## 3. テーブル定義

### 3.1 `books`（書籍）

| カラム | 型 | NULL | 既定値 | 説明 | 対応要件 |
|---|---|---|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | NO | — | 主キー | — |
| `title` | `VARCHAR(255)` | NO | — | タイトル（書名） | FR-002, FR-005, FR-010 |
| `author` | `VARCHAR(255)` | NO | — | 著者 | FR-002, FR-005 |
| `price` | `INT UNSIGNED` | NO | — | 価格（税込・円・整数） | FR-002, FR-005, FR-013 / D-10 |
| `description` | `TEXT` | NO | — | 説明文 | FR-005 |
| `cover_image_url` | `VARCHAR(512)` | YES | `NULL` | 書影の URL。NULL の場合は代替表示（Edge Cases） | FR-002, FR-005 |
| `is_available` | `BOOLEAN` | NO | `TRUE` | 販売状態。TRUE=販売中 / FALSE=販売停止 | FR-001a / D-04 |
| `created_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP` | 作成日時 | — |
| `updated_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP ON UPDATE` | 更新日時 | — |

**制約・索引**
- PRIMARY KEY (`id`)
- INDEX `idx_books_is_available` (`is_available`) — 一覧・詳細の絞り込みで常に使うため

**業務ルール**
- 一覧・詳細の取得は必ず `WHERE is_available = TRUE` を含める（FR-001a, FR-005a）
- 一覧の並び順は `ORDER BY id ASC` で固定する（FR-001d / D-05）
- ページングを行わない（FR-001c / D-05）

---

### 3.2 `orders`（注文）

| カラム | 型 | NULL | 既定値 | 説明 | 対応要件 |
|---|---|---|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | NO | — | 主キー（内部 ID。外部には出さない） | — |
| `order_number` | `CHAR(26)` | NO | — | 注文番号。ULID 形式・Base32・26文字 | FR-023, SC-005 / D-03 |
| `customer_name` | `VARCHAR(100)` | NO | — | 氏名 | FR-017 |
| `customer_address` | `VARCHAR(255)` | NO | — | 住所 | FR-017 |
| `customer_email` | `VARCHAR(255)` | NO | — | メールアドレス | FR-017, FR-019 |
| `total_amount` | `INT UNSIGNED` | NO | — | 注文時点の合計金額（円・整数） | FR-024 / D-10 |
| `created_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP` | 注文日時 | — |

**制約・索引**
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_orders_order_number` (`order_number`) — 注文番号の重複を DB で保証（SC-005 / D-03, D-08）

**業務ルール**
- `total_amount` は明細の小計の総和と一致しなければならない。送料・手数料・割引は含まない（FR-013, FR-024）
- 確定後に更新しない（追記のみ）。以後の書籍価格の変更に影響されない（FR-024, SC-006）
- 注文番号は画面のアドレスに含めない（FR-029b）。参照用の API も設けない（research.md D-02）

---

### 3.3 `order_items`（注文明細）

| カラム | 型 | NULL | 既定値 | 説明 | 対応要件 |
|---|---|---|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | NO | — | 主キー | — |
| `order_id` | `INT UNSIGNED` | NO | — | `orders.id` への外部キー | — |
| `book_id` | `INT UNSIGNED` | YES | `NULL` | `books.id` への参照。表示には使わない | — |
| `title` | `VARCHAR(255)` | NO | — | **注文時点の**書名（スナップショット） | FR-024, SC-006 |
| `unit_price` | `INT UNSIGNED` | NO | — | **注文時点の**単価（円・整数） | FR-024, SC-006 / D-10 |
| `quantity` | `INT UNSIGNED` | NO | — | 数量（1以上） | FR-011, FR-024 |
| `subtotal` | `INT UNSIGNED` | NO | — | 小計（`unit_price × quantity`） | FR-010, FR-024 |

**制約・索引**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE SET NULL
- INDEX `idx_order_items_order_id` (`order_id`)
- CHECK (`quantity` >= 1)

**業務ルール**
- `title` / `unit_price` は注文確定時に `books` から**値としてコピー**する。以後 `books` が変わっても `order_items` は変わらない（FR-024, SC-006）
- 注文内容の表示・参照には必ずスナップショット列を使い、`book_id` から `books` を引き直さない
- `book_id` を NULL 許容にしているのは、書籍が削除されても注文記録が失われないようにするため（FR-024）
- 1注文につき同一書籍の明細は1行（カート側で1書籍1行を保証する・FR-009）

---

## 4. カート（非永続・ブラウザ内）

サーバに永続化しないため DB テーブルを持たない（research.md D-01）。

**保存形式**（`localStorage` のキー: `cart`）

```json
[
  { "bookId": 1, "quantity": 2 },
  { "bookId": 5, "quantity": 1 }
]
```

**業務ルール**

| ルール | 対応要件 |
|---|---|
| 同一 `bookId` は常に1要素。既存があれば `quantity` を加算する | FR-009 |
| `quantity` が 0 になった要素は配列から取り除く | FR-011a |
| `quantity` に上限を設けない | FR-011b |
| 書名・価格は保存しない（表示のたびに API の最新値を使う） | research.md D-01 |
| 変更のたびに `localStorage` へ同期し、ヘッダーの件数（数量の合計）を更新する | FR-032〜FR-034 |
| 注文確定の**成功時のみ**空にし、`localStorage` からも削除する | FR-022a, FR-022b |
| 読み書きの失敗時はメモリ上のカートとして動作を継続する（画面を壊さない） | 憲法§3 / D-01 |

**導出値**（いずれも純関数として実装し単体テスト対象・SC-008）

| 値 | 算出式 | 対応要件 |
|---|---|---|
| 小計 | `book.price × quantity` | FR-010 |
| 合計 | 全明細の小計の総和 | FR-013 |
| ヘッダー件数 | 全明細の `quantity` の総和（行数ではない） | FR-033 |

---

## 5. データアクセス方針

- すべてのクエリで `mysql2` のプレースホルダ（`?`）を使用し、リクエスト値を SQL 文字列へ直接連結しない（`tech-stack.md` §8）
- スキーマ定義は `mysql/init/` の初期化 SQL のみで行う。アプリケーションコードから `CREATE` / `DROP` / `TRUNCATE` 等の DDL を発行しない（憲法§1 / `tech-stack.md` §8）
- 接続情報は `.env`／環境変数から取得し、コードへ直書きしない（requirements.md §4 / `tech-stack.md` §8）
- 注文作成は単一トランザクションで実行する（`orders` INSERT → `order_items` INSERT → COMMIT）。途中失敗時は ROLLBACK し、部分的な注文を残さない（FR-026 / D-08）

---

## 6. 初期データ（`mysql/init/02_seed.sql`）

| 要件 | 内容 |
|---|---|
| 件数 | 全件1画面表示が成立する規模（十数冊程度）。FR-001c / spec.md Assumptions |
| 販売停止の書籍 | **1冊以上含める**。FR-001a / FR-005a / FR-016b の検証に必要 |
| 書影なしの書籍 | **1冊以上含める**（`cover_image_url` が NULL）。Edge Cases の代替表示の検証に必要 |
| 価格 | 整数円。D-10 |

---

## 7. 要件トレーサビリティ

| 要件 | 反映箇所 |
|---|---|
| FR-001a（販売状態） | `books.is_available` |
| FR-001c / FR-001d（全件・順序固定） | 3.1 業務ルール |
| FR-002 / FR-005（表示項目） | `books` の各列 |
| FR-009 / FR-011a / FR-011b（カートの操作規則） | §4 業務ルール |
| FR-010 / FR-013 / FR-033（小計・合計・件数） | §4 導出値 |
| FR-016 / FR-016a（同一ブラウザで永続・跨がない） | §4（`localStorage`） |
| FR-016b（販売停止・削除の検出） | `books.is_available` ＋ `POST /api/orders` の検証 |
| FR-017（顧客情報3項目） | `orders.customer_*` |
| FR-022a / FR-022b（確定後のカート） | §4 業務ルール |
| FR-023 / SC-005（注文番号の一意性） | `orders.order_number` ＋ UNIQUE |
| FR-024 / SC-006（スナップショット） | `order_items.title` / `unit_price` / `subtotal` |
| FR-025（重複確定の防止） | §5 トランザクション ＋ UNIQUE |
| FR-029b（注文番号を URL に出さない） | `orders.id` と `order_number` の分離 |
