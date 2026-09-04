# Phase 1 Data Model: 個人運営オンライン書店 購買フロー

**Branch**: `003-bookstore-purchase-flow` | **Date**: 2026-09-03
**Source**: [spec.md](spec.md) Key Entities / [research.md](research.md) D-08〜D-10

DB は MySQL 8.0。カート（Cart / CartItem）は**永続化しない**（CL-001、クライアント `localStorage`）。したがってテーブルは `books` / `orders` / `order_items` の3つ。

---

## 1. エンティティ概要

| エンティティ | 永続化先 | 説明 |
|---|---|---|
| 書籍 Book | `books` テーブル | 販売対象の書籍カタログ。事前登録（登録手段はスコープ外） |
| カート Cart | クライアント `localStorage` | 単一ブラウザ内の購入予定リスト。`{ items: CartItem[] }` |
| カート明細 CartItem | 同上（Cart 内配列要素） | `{ bookId: number, quantity: number(1..99) }` のみ保持。単価・書名は表示時に API 値を使用 |
| 注文 Order | `orders` テーブル | 確定した1回の注文。注文者情報・合計・注文日時・注文番号 |
| 注文明細 OrderLineItem | `order_items` テーブル | 注文内の1書籍分。注文時点の書名・単価をスナップショット保持 |

---

## 2. テーブル定義

### 2.1 `books`

| 列 | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 書籍ID |
| `title` | `VARCHAR(255)` | NOT NULL | タイトル |
| `author` | `VARCHAR(255)` | NOT NULL | 著者 |
| `price` | `INT UNSIGNED` | NOT NULL | 価格（円・整数、D-09） |
| `cover_image_url` | `VARCHAR(1024)` | NOT NULL | 書影の URL（外部/静的パス） |
| `description` | `TEXT` | NOT NULL DEFAULT ('') | 説明文（一覧では未使用、詳細で表示） |
| `status` | `ENUM('selling','unlisted')` | NOT NULL DEFAULT 'selling' | 販売状態。一覧・詳細・注文可否は `selling` のみ対象 |
| `created_at` | `DATETIME(3)` | NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | 作成日時 |
| `updated_at` | `DATETIME(3)` | NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) | 更新日時 |

- **インデックス**: `idx_books_status_id (status, id)` … 一覧の「販売中を id 順でページング」を支える。
- **バリデーション（アプリ層）**: `title`/`author` は1文字以上、`price` は 0 以上の整数、`cover_image_url` は非空。
- **状態遷移**: `selling` ⇄ `unlisted`（登録・編集手段はスコープ外のため本機能では変更しない。読み取りのみ）。

### 2.2 `orders`

| 列 | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 内部ID（外部露出しない） |
| `order_number` | `VARCHAR(32)` | NOT NULL, UNIQUE (`uq_orders_order_number`) | 注文番号 `ORD-` + ULID(Base32 26文字)（D-05, FR-022, CL-003） |
| `customer_name` | `VARCHAR(255)` | NOT NULL | 注文者氏名（トリム後1文字以上） |
| `customer_address` | `VARCHAR(1000)` | NOT NULL | 注文者住所（トリム後1文字以上） |
| `customer_email` | `VARCHAR(255)` | NOT NULL | 注文者メールアドレス（形式検証済み） |
| `total_amount` | `INT UNSIGNED` | NOT NULL | 合計金額（`order_items.subtotal` の総和。サーバ再計算値） |
| `ordered_at` | `DATETIME(3)` | NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | 注文確定日時 |
| `created_at` | `DATETIME(3)` | NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | レコード作成日時（`ordered_at` と同値運用） |

- **インデックス**: PK と `uq_orders_order_number` のみ。
- **不変性**: 確定後の更新・削除は本機能では行わない（Assumptions: 変更・キャンセルはスコープ外）。

### 2.3 `order_items`

| 列 | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 明細ID |
| `order_id` | `BIGINT UNSIGNED` | NOT NULL, FK → `orders.id` ON DELETE CASCADE | 所属注文 |
| `book_id` | `BIGINT UNSIGNED` | NULL, FK → `books.id` ON DELETE SET NULL | 参照書籍（将来書籍が消えても明細は残す） |
| `title_snapshot` | `VARCHAR(255)` | NOT NULL | 注文時点の書名（CL-005, FR-024a） |
| `unit_price_snapshot` | `INT UNSIGNED` | NOT NULL | 注文時点の単価（円） |
| `quantity` | `INT UNSIGNED` | NOT NULL, CHECK (`quantity` BETWEEN 1 AND 99) | 数量（D-03） |
| `subtotal` | `INT UNSIGNED` | NOT NULL | `unit_price_snapshot * quantity`（サーバ算出、FR-014） |

- **インデックス**: `idx_order_items_order_id (order_id)`。
- **整合性**: 1注文につき同一 `book_id` は1行（カートで数量集約済み、CL-002）。`subtotal` と `total_amount` はアプリが計算して書き込み、DB 側 generated column にはしない（MySQL 版差異回避）。

---

## 3. 関係（ER）

```text
books (1) ────< (0..N) order_items >──── (N..1) orders
        book_id (nullable)          order_id (cascade)

Cart / CartItem : DB 非永続（localStorage）。注文確定時に order_items へ変換される。
```

- `orders 1 : N order_items`（`order_items.order_id` 必須、注文は1明細以上＝FR-020 前提の非空カート）。
- `books 1 : N order_items`（`order_items.book_id` は任意。書籍削除時も明細の `title_snapshot`/`unit_price_snapshot` で内容を保持）。

---

## 4. 導出値・計算規則

| 値 | 定義 | 実装箇所 |
|---|---|---|
| カート小計（表示） | `book.price × cartItem.quantity` | フロント `lib/cartTotal.ts` |
| カート合計（表示） | Σ 各明細の小計（送料等なし、FR-012） | フロント `lib/cartTotal.ts` |
| 注文明細 `subtotal` | `unit_price_snapshot × quantity` | バック `domain/pricing.ts` |
| 注文 `total_amount` | Σ `order_items.subtotal` | バック `domain/pricing.ts` |
| `order_number` | `ORD-` + ULID→Crockford Base32(26) | バック `domain/orderNumber.ts` |

> フロントの表示合計とバックの確定合計は**同一の計算規則**（整数円の単純合算）で一致する（SC-006）。バックは表示値を信頼せず `books` 現在値で再計算する（D-08）。

---

## 5. バリデーション規則（注文作成 `POST /api/orders`）

| 対象 | 規則 | 失敗時 `fields` キー |
|---|---|---|
| `customer.name` | 必須、トリム後 1〜255 文字 | `name` |
| `customer.address` | 必須、トリム後 1〜1000 文字 | `address` |
| `customer.email` | 必須、1〜255 文字、メール形式（実用的正規表現） | `email` |
| `items` | 配列、1件以上 | `items` |
| `items[].bookId` | 整数、`books` に存在し `status='selling'` | `items` |
| `items[].quantity` | 整数、1〜99 | `items` |

- 1つでも違反があれば `400`（注文は作成しない、FR-018）。すべて通れば `orders`+`order_items` を単一トランザクションで作成し `201`（FR-020, FR-024）。
- 成功後、フロントは `localStorage` のカートを空にする（FR-020a, CL-004）。

---

## 6. シードデータ（`mysql/init/002_seed_books.sql`）

- デモ用に `status='selling'` の書籍を **20〜30 件**投入（ページング動作確認のため既定 `pageSize=12` の2ページ以上）。
- `unlisted` を数件混ぜ、一覧・注文対象から除外されることをテストできるようにする。
- **書影は外部 URL を使わず、フロントの静的アセットを参照する**（外部依存を増やさない、D-11 の方針と整合）:
  - `frontend/public/images/books/placeholder.svg` にプレースホルダ画像を1枚用意する。
  - シードの全書籍の `cover_image_url` は `/images/books/placeholder.svg` に統一する（`NEXT_PUBLIC_` 不要の相対パス。フロントは `<img src={coverImageUrl}>` でそのまま描画）。
  - 将来、書籍ごとの実画像を使う場合は `frontend/public/images/books/<id>.jpg` を配置し `cover_image_url` を差し替える（本機能では placeholder 統一で可）。
