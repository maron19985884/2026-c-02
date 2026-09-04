# テーブル定義書 — 個人運営オンライン書店 購買フロー

> **生成元**: /speckit.design table (AI生成) — 内容を確認の上、DB担当者が承認してから適用すること
> 関連: [憲法 §7](../../.specify/memory/constitution.md) / [data-model.md](data-model.md) / [基本設計書](basic-design.md) / [詳細設計書](detailed-design.md)

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | TABLE-003 |
| 対象フィーチャー | [`specs/003-bookstore-purchase-flow/`](.) |
| 元データ | [`specs/003-bookstore-purchase-flow/data-model.md`](data-model.md) |
| DB | MySQL 8.0（[`tech-stack.md`](../../tech-stack.md) §2） / 文字コード `utf8mb4` / 照合 `utf8mb4_0900_ai_ci` / エンジン InnoDB |
| 作成日 | 2026-09-04 |
| 作成者 | AI生成（`/speckit.design table`） |
| 承認者 | （未） |
| 承認日 | （未） |
| バージョン | 1.0 |

---

## 1. テーブル一覧

| テーブルID | 物理名 | 論理名 | 概要 |
|---|---|---|---|
| TBL-001 | `books` | 書籍 | 販売対象の書籍カタログ。`status='selling'` のみ一覧・詳細・注文対象 |
| TBL-002 | `orders` | 注文 | 確定した1回の注文（注文番号・注文者情報・合計・注文日時） |
| TBL-003 | `order_items` | 注文明細 | 注文に含まれる1書籍分。注文時点の書名・単価をスナップショット保持 |

> カート（Cart / CartItem）はブラウザの `localStorage` に保持し **DB テーブルを持たない**（[data-model.md](data-model.md) §1、CL-001）。

---

## 2. テーブル定義詳細

### 2.1 `books` / 書籍

**テーブル概要**: 販売する書籍の情報を管理する。事前登録（登録・編集手段は本機能のスコープ外）。本機能からは参照のみ。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | 書籍ID | BIGINT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK。API では `number` として返す |
| 2 | `title` | タイトル | VARCHAR | 255 | ✓ | — | 1文字以上（アプリ層検証） |
| 3 | `author` | 著者 | VARCHAR | 255 | ✓ | — | 1文字以上 |
| 4 | `price` | 価格 | INT UNSIGNED | — | ✓ | — | 円単位の整数。小数・通貨コードなし |
| 5 | `cover_image_url` | 書影URL | VARCHAR | 1024 | ✓ | — | 本機能では `/images/books/placeholder.svg` に統一（T010 / T010b） |
| 6 | `description` | 説明文 | TEXT | — | ✓ | `('')` | 一覧では未返却、詳細で返却。空文字可 |
| 7 | `status` | 販売状態 | ENUM('selling','unlisted') | — | ✓ | `'selling'` | `selling` のみ一覧・詳細・注文対象 |
| 8 | `created_at` | 作成日時 | DATETIME(3) | — | ✓ | CURRENT_TIMESTAMP(3) | |
| 9 | `updated_at` | 更新日時 | DATETIME(3) | — | ✓ | CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) | |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー |
| `idx_books_status_id` | INDEX | (`status`, `id`) | 「販売中を id 順でページング」（`WHERE status='selling' ORDER BY id LIMIT ? OFFSET ?`）を支える |

#### 制約

| 制約名 | 種別 | 対象カラム | 内容 |
|---|---|---|---|
| （型制約） | ENUM | `status` | `'selling'` / `'unlisted'` のみ |
| （アプリ層） | — | `title`,`author`,`price` | 非空・`price >= 0` はアプリで担保（CHECK は必須としない） |

---

### 2.2 `orders` / 注文

**テーブル概要**: 確定した注文のヘッダ。1件につき1回の注文確定に対応。確定後の更新・削除は本機能では行わない。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | 内部ID | BIGINT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK。API 非公開 |
| 2 | `order_number` | 注文番号 | VARCHAR | 32 | ✓ | — | `ORD-` + Crockford Base32 26文字（実長 30）。UNIQUE。利用者向け識別子（FR-022 / CL-003） |
| 3 | `customer_name` | 注文者氏名 | VARCHAR | 255 | ✓ | — | トリム後1文字以上 |
| 4 | `customer_address` | 注文者住所 | VARCHAR | 1000 | ✓ | — | トリム後1文字以上 |
| 5 | `customer_email` | 注文者メール | VARCHAR | 255 | ✓ | — | 形式検証済み（実用的正規表現） |
| 6 | `total_amount` | 合計金額 | INT UNSIGNED | — | ✓ | — | Σ `order_items.subtotal`（サーバ再計算値）。送料等なし |
| 7 | `ordered_at` | 注文確定日時 | DATETIME(3) | — | ✓ | CURRENT_TIMESTAMP(3) | API `orderedAt`（UTC で返却） |
| 8 | `created_at` | レコード作成日時 | DATETIME(3) | — | ✓ | CURRENT_TIMESTAMP(3) | 運用上 `ordered_at` と同値 |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー |
| `uq_orders_order_number` | UNIQUE | `order_number` | 注文番号の一意性（SC-004）。補助照会 `WHERE order_number=?` |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 |
|---|---|---|---|
| `uq_orders_order_number` | UNIQUE KEY | `order_number` | — |

---

### 2.3 `order_items` / 注文明細

**テーブル概要**: 注文に含まれる書籍ごとの明細。注文時点の書名・単価をスナップショット保存し、以後の書籍変更の影響を受けない（FR-024a / CL-005）。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | 明細ID | BIGINT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK |
| 2 | `order_id` | 注文ID | BIGINT UNSIGNED | — | ✓ | — | FK → `orders.id`（ON DELETE CASCADE） |
| 3 | `book_id` | 書籍ID | BIGINT UNSIGNED | — | — | NULL | FK → `books.id`（ON DELETE SET NULL）。書籍が消えても明細は残す |
| 4 | `title_snapshot` | 書名スナップショット | VARCHAR | 255 | ✓ | — | 注文時点の `books.title` |
| 5 | `unit_price_snapshot` | 単価スナップショット | INT UNSIGNED | — | ✓ | — | 注文時点の `books.price`（円） |
| 6 | `quantity` | 数量 | INT UNSIGNED | — | ✓ | — | 1..99（CHECK） |
| 7 | `subtotal` | 小計 | INT UNSIGNED | — | ✓ | — | `unit_price_snapshot * quantity`（アプリ算出値を格納） |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー |
| `idx_order_items_order_id` | INDEX | `order_id` | 注文単位の明細取得（補助照会の JOIN） |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 / 条件 |
|---|---|---|---|
| `fk_order_items_order` | FOREIGN KEY | `order_id` | `orders(id)` ON DELETE CASCADE ON UPDATE CASCADE |
| `fk_order_items_book` | FOREIGN KEY | `book_id` | `books(id)` ON DELETE SET NULL ON UPDATE CASCADE |
| `chk_order_items_quantity` | CHECK | `quantity` | `quantity BETWEEN 1 AND 99` |
| （運用ルール） | — | (`order_id`,`book_id`) | 1注文につき同一 `book_id` は1行（カートで数量集約済み／CL-002）。DB 制約にはしない（`book_id` NULL 許容のため） |

---

## 3. ER 図（HTMLベース）

<!-- plantuml:
@startuml
hide circle
skinparam linetype ortho
entity books {
  *id : BIGINT UNSIGNED <<PK>>
  --
  title : VARCHAR(255)
  author : VARCHAR(255)
  price : INT UNSIGNED
  cover_image_url : VARCHAR(1024)
  description : TEXT
  status : ENUM('selling','unlisted')
  created_at / updated_at : DATETIME(3)
}
entity orders {
  *id : BIGINT UNSIGNED <<PK>>
  --
  order_number : VARCHAR(32) <<UQ>>
  customer_name : VARCHAR(255)
  customer_address : VARCHAR(1000)
  customer_email : VARCHAR(255)
  total_amount : INT UNSIGNED
  ordered_at / created_at : DATETIME(3)
}
entity order_items {
  *id : BIGINT UNSIGNED <<PK>>
  --
  order_id : BIGINT UNSIGNED <<FK>>
  book_id : BIGINT UNSIGNED <<FK, null>>
  title_snapshot : VARCHAR(255)
  unit_price_snapshot : INT UNSIGNED
  quantity : INT UNSIGNED
  subtotal : INT UNSIGNED
}
orders ||--|{ order_items : "order_id (CASCADE)"
books ||--o{ order_items : "book_id (SET NULL)"
@enduml
-->

<div style="font-family:system-ui,sans-serif;overflow-x:auto;">
<svg viewBox="0 0 920 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="テーブル ER図">
  <defs>
    <marker id="tk" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#0891b2"/></marker>
  </defs>
  <style>
    .tb{fill:#ffffff;stroke:#0891b2;stroke-width:1.6;}
    .th{fill:#ecfeff;stroke:#0891b2;stroke-width:1.6;}
    .tn{font-size:13px;fill:#0f172a;font-weight:bold;font-family:system-ui;}
    .tf{font-size:10.5px;fill:#334155;font-family:ui-monospace,monospace;}
    .tr{stroke:#0891b2;stroke-width:1.6;fill:none;marker-end:url(#tk);}
    .trl{font-size:10.5px;fill:#0891b2;font-family:system-ui;}
  </style>

  <!-- books -->
  <rect x="30" y="120" width="250" height="180" class="tb" rx="6"/>
  <rect x="30" y="120" width="250" height="24" class="th" rx="6"/>
  <text x="42" y="137" class="tn">books</text>
  <text x="42" y="162" class="tf">PK  id : BIGINT UNSIGNED</text>
  <text x="42" y="180" class="tf">    title / author : VARCHAR(255)</text>
  <text x="42" y="198" class="tf">    price : INT UNSIGNED</text>
  <text x="42" y="216" class="tf">    cover_image_url : VARCHAR(1024)</text>
  <text x="42" y="234" class="tf">    description : TEXT</text>
  <text x="42" y="252" class="tf">    status : ENUM(selling/unlisted)</text>
  <text x="42" y="270" class="tf">    created_at / updated_at</text>
  <text x="42" y="288" class="tf">IX  idx_books_status_id (status,id)</text>

  <!-- orders -->
  <rect x="640" y="30" width="255" height="180" class="tb" rx="6"/>
  <rect x="640" y="30" width="255" height="24" class="th" rx="6"/>
  <text x="652" y="47" class="tn">orders</text>
  <text x="652" y="72" class="tf">PK  id : BIGINT UNSIGNED</text>
  <text x="652" y="90" class="tf">UQ  order_number : VARCHAR(32)</text>
  <text x="652" y="108" class="tf">    customer_name : VARCHAR(255)</text>
  <text x="652" y="126" class="tf">    customer_address : VARCHAR(1000)</text>
  <text x="652" y="144" class="tf">    customer_email : VARCHAR(255)</text>
  <text x="652" y="162" class="tf">    total_amount : INT UNSIGNED</text>
  <text x="652" y="180" class="tf">    ordered_at / created_at</text>

  <!-- order_items -->
  <rect x="330" y="250" width="290" height="165" class="tb" rx="6"/>
  <rect x="330" y="250" width="290" height="24" class="th" rx="6"/>
  <text x="342" y="267" class="tn">order_items</text>
  <text x="342" y="292" class="tf">PK  id : BIGINT UNSIGNED</text>
  <text x="342" y="310" class="tf">FK  order_id → orders.id (CASCADE)</text>
  <text x="342" y="328" class="tf">FK  book_id → books.id (SET NULL, null)</text>
  <text x="342" y="346" class="tf">    title_snapshot : VARCHAR(255)</text>
  <text x="342" y="364" class="tf">    unit_price_snapshot : INT UNSIGNED</text>
  <text x="342" y="382" class="tf">    quantity (CHECK 1..99) / subtotal</text>
  <text x="342" y="400" class="tf">IX  idx_order_items_order_id (order_id)</text>

  <!-- relations -->
  <path d="M 700 210 Q 560 250 560 248" class="tr"/>
  <text x="585" y="240" class="trl">1 : N（order_id, CASCADE）</text>
  <path d="M 220 300 Q 300 350 328 340" class="tr"/>
  <text x="210" y="330" class="trl">1 : N（book_id, SET NULL）</text>
</svg>
</div>

**関係まとめ**

| 親 | 子 | 対応 | 外部キー | 削除時 |
|---|---|---|---|---|
| `orders` | `order_items` | 1 : N（1注文に1明細以上） | `order_items.order_id` → `orders.id` | CASCADE（注文削除で明細も削除。※本機能では注文削除は行わない） |
| `books` | `order_items` | 1 : N（`book_id` は NULL 許容） | `order_items.book_id` → `books.id` | SET NULL（書籍削除でも明細は `*_snapshot` で内容保持） |

---

## 4. DDL（参考）

> ⚠️ 本 DDL は設計確認用の参考情報です。適用は `mysql/init/001_schema.sql`（初回起動時の `docker-entrypoint-initdb.d`）またはマイグレーション経由で行い、`DROP` / `TRUNCATE` 等の破壊的 DDL は生成・実行しないこと（憲法§1）。

```sql
-- TBL-001: books
CREATE TABLE IF NOT EXISTS books (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(255)    NOT NULL,
  author          VARCHAR(255)    NOT NULL,
  price           INT UNSIGNED    NOT NULL,
  cover_image_url VARCHAR(1024)   NOT NULL,
  description     TEXT            NOT NULL,
  status          ENUM('selling','unlisted') NOT NULL DEFAULT 'selling',
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_books_status_id (status, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TBL-002: orders
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number     VARCHAR(32)     NOT NULL,
  customer_name    VARCHAR(255)    NOT NULL,
  customer_address VARCHAR(1000)   NOT NULL,
  customer_email   VARCHAR(255)    NOT NULL,
  total_amount     INT UNSIGNED    NOT NULL,
  ordered_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TBL-003: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id            BIGINT UNSIGNED NOT NULL,
  book_id             BIGINT UNSIGNED NULL,
  title_snapshot      VARCHAR(255)    NOT NULL,
  unit_price_snapshot INT UNSIGNED    NOT NULL,
  quantity            INT UNSIGNED    NOT NULL,
  subtotal            INT UNSIGNED    NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_book  FOREIGN KEY (book_id)  REFERENCES books (id)  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_order_items_quantity CHECK (quantity BETWEEN 1 AND 99)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

> 参考: シードは `mysql/init/002_seed_books.sql` で `books` に 20〜30 件（`selling` 中心＋`unlisted` 数件）を投入。`orders` / `order_items` は空で開始し、`POST /api/orders` により登録される。

<!-- 要確認: (1) MySQL 8.0 の照合順序を utf8mb4_0900_ai_ci でよいか（環境の既定と整合）。(2) order_number の実長（ORD- + 26 = 30）に対し VARCHAR(32) で余裕を持たせているが、桁を固定したい場合は CHAR(30) も可。(3) CHECK 制約は MySQL 8.0.16+ で有効。稼働バージョンを確認すること。 -->

---

## 5. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | | | — |
| アーキテクト / テックリード / DB担当 | | | |
| PM / プロジェクトリーダー | | | |
