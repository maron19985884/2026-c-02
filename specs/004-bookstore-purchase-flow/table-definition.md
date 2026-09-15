# テーブル定義書 — オンライン書店の購買フロー

> **生成元**: /speckit.design table (AI生成) — 内容を確認の上、DB担当者が承認してから適用すること

> **図の表示について**: 憲法§7 に従い、ER 図はインライン SVG（HTML）で記述している。
> GitHub の Markdown ビューアはインライン SVG を除去するため、ローカルのプレビューで閲覧すること。
> 再生成用の PlantUML 記法を `<!-- plantuml: ... -->` としてコメントで併記している。

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | TABLE-004 |
| 対象フィーチャー | [`specs/004-bookstore-purchase-flow/`](./spec.md) |
| 元データ | [`specs/004-bookstore-purchase-flow/data-model.md`](./data-model.md) |
| 作成日 | 2026-09-15 |
| 作成者 | AI生成（`/speckit.design table`） |
| 承認者 | <!-- 要確認: 承認者未定（DB担当者） --> |
| 承認日 | <!-- 要確認: 未承認 --> |
| バージョン | 1.0 |

**DBMS**: MySQL 8.0（`docker-compose.yml` の `mysql:8.0`）
**文字セット / 照合順序**: `utf8mb4` / `utf8mb4_unicode_ci`（雛形 `mysql/init/01_init.sql` の方針を踏襲）
**ストレージエンジン**: InnoDB（外部キー・トランザクションが必要なため）
**適用方法**: `mysql/init/` に配置した初期化 SQL が、データベースが空のときに `docker-entrypoint-initdb.d` により自動実行される

---

## 1. テーブル一覧

| テーブルID | テーブル名（物理名） | テーブル名（論理名） | 概要 |
|---|---|---|---|
| TBL-001 | `books` | 書籍 | 販売対象の書籍。書影・タイトル・著者・価格・説明文・販売状態を保持する。本フィーチャーからは参照のみ |
| TBL-002 | `orders` | 注文 | 確定した注文のヘッダ。注文番号・顧客情報・合計金額を保持する。確定後は更新しない |
| TBL-003 | `order_items` | 注文明細 | 注文に含まれる書籍ごとの確定内容。**注文時点の書名・単価のスナップショット**を保持する |

### 1.1 テーブルを持たないデータ

| データ | 保持場所 | 理由 |
|---|---|---|
| カート（`{ bookId, quantity }` の配列） | ブラウザの `localStorage`（キー `cart`） | 会員機能がなく利用者を識別できないため、サーバにカートの持ち主を特定する手段がない（FR-016a / research.md D-01） |
| 直前の注文結果 | ブラウザの `sessionStorage`（キー `lastOrder`） | 注文完了画面への一度きりの受け渡し。読み出し後に即削除する（FR-029a / research.md D-02） |

---

## 2. テーブル定義詳細

### 2.1 `books` / 書籍（TBL-001）

**テーブル概要**: 販売対象の書籍を管理する。初期データとして投入され、本フィーチャーは登録・編集・削除および販売状態の変更を行わない（FR-001b）。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | ID | INT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK |
| 2 | `title` | タイトル（書名） | VARCHAR | 255 | ✓ | — | 一覧・詳細・カートで表示。注文時に `order_items.title` へコピー |
| 3 | `author` | 著者 | VARCHAR | 255 | ✓ | — | 一覧・詳細で表示 |
| 4 | `price` | 価格 | INT UNSIGNED | — | ✓ | — | **税込・日本円・整数**。小数を扱わない（research.md D-10） |
| 5 | `description` | 説明文 | TEXT | — | ✓ | — | 詳細画面のみで表示。一覧の API 応答には含めない |
| 6 | `cover_image_url` | 書影URL | VARCHAR | 512 | — | NULL | **NULL 可**。NULL のとき画面は代替表示を行う |
| 7 | `is_available` | 販売状態 | BOOLEAN | — | ✓ | TRUE | TRUE=販売中 / FALSE=販売停止。MySQL では `TINYINT(1)` として格納される |
| 8 | `created_at` | 作成日時 | TIMESTAMP | — | ✓ | CURRENT_TIMESTAMP | |
| 9 | `updated_at` | 更新日時 | TIMESTAMP | — | ✓ | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー。詳細取得・注文時の突合で使用 |
| `idx_books_is_available` | INDEX | `is_available` | 一覧・詳細の絞り込みで常に条件に含まれるため |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 / 条件 |
|---|---|---|---|
| — | — | — | 外部キー・CHECK 制約なし |

#### 業務ルール

- 一覧・詳細の取得クエリは必ず `WHERE is_available = TRUE` を含める（FR-001a / FR-005a）
- 一覧の並び順は `ORDER BY id ASC` で固定する（FR-001d）
- ページングを行わず全件を返す（FR-001c）

---

### 2.2 `orders` / 注文（TBL-002）

**テーブル概要**: 確定した注文のヘッダ情報を管理する。顧客情報は会員情報ではなく注文単位の情報として本テーブルに保持する。確定後は更新・削除を行わない（追記のみ）。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | ID | INT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK。**内部 ID。API 応答に含めない**（FR-029b） |
| 2 | `order_number` | 注文番号 | CHAR | 26 | ✓ | — | ULID 形式・Crockford Base32。**外部に見せる唯一の識別子**。UNIQUE |
| 3 | `customer_name` | 氏名 | VARCHAR | 100 | ✓ | — | 必須入力（FR-017） |
| 4 | `customer_address` | 住所 | VARCHAR | 255 | ✓ | — | 必須入力（FR-017） |
| 5 | `customer_email` | メールアドレス | VARCHAR | 255 | ✓ | — | 必須入力。形式検証のみで実在確認は行わない（FR-019） |
| 6 | `total_amount` | 合計金額 | INT UNSIGNED | — | ✓ | — | 注文時点の合計（整数円）。送料・手数料・割引を含まない |
| 7 | `created_at` | 注文日時 | TIMESTAMP | — | ✓ | CURRENT_TIMESTAMP | |

> `updated_at` を設けていない。確定後に更新しないテーブルであり、更新日時を持つと「更新しうる」という誤った設計意図を伝えるため。

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー。`order_items.order_id` から参照される |
| `uk_orders_order_number` | UNIQUE | `order_number` | 注文番号の一意性を DB で保証する（SC-005） |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 / 条件 |
|---|---|---|---|
| `uk_orders_order_number` | UNIQUE | `order_number` | 重複時は INSERT が失敗し、トランザクションが ROLLBACK される（FR-026 に合流） |

#### 業務ルール

- `total_amount` は `order_items.subtotal` の総和と一致しなければならない（FR-013 / FR-024）
- 金額は**サーバ側が `books.price` から算出**する。クライアントの送信値を使わない（FR-024）
- 注文番号を検索条件とする API を設けない（FR-029b / research.md D-02）

---

### 2.3 `order_items` / 注文明細（TBL-003）

**テーブル概要**: 注文に含まれる書籍ごとの確定内容を管理する。**注文時点の書名・単価をスナップショットとして保持**し、以後 `books` が変更されても注文記録が変化しないようにする（FR-024 / SC-006）。

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | `id` | ID | INT UNSIGNED | — | ✓ | AUTO_INCREMENT | PK |
| 2 | `order_id` | 注文ID | INT UNSIGNED | — | ✓ | — | FK → `orders.id` |
| 3 | `book_id` | 書籍ID | INT UNSIGNED | — | — | NULL | FK → `books.id`。**NULL 可**（書籍が削除されても注文記録を残すため）。**表示には使わない** |
| 4 | `title` | 書名（注文時点） | VARCHAR | 255 | ✓ | — | **スナップショット**。`books.title` の値コピー |
| 5 | `unit_price` | 単価（注文時点） | INT UNSIGNED | — | ✓ | — | **スナップショット**。`books.price` の値コピー（整数円） |
| 6 | `quantity` | 数量 | INT UNSIGNED | — | ✓ | — | 1以上。上限を設けない（FR-011b） |
| 7 | `subtotal` | 小計 | INT UNSIGNED | — | ✓ | — | `unit_price × quantity`。冗長だが注文記録の自己完結性のため保持する |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| `PRIMARY` | PRIMARY KEY | `id` | 主キー |
| `idx_order_items_order_id` | INDEX | `order_id` | 注文単位での明細取得 |
| `idx_order_items_book_id` | INDEX | `book_id` | 外部キー制約に伴う索引 |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 / 条件 |
|---|---|---|---|
| `fk_order_items_order` | FOREIGN KEY | `order_id` | `orders`.`id` — ON DELETE CASCADE / ON UPDATE RESTRICT |
| `fk_order_items_book` | FOREIGN KEY | `book_id` | `books`.`id` — ON DELETE SET NULL / ON UPDATE RESTRICT |
| `chk_order_items_quantity` | CHECK | `quantity` | `quantity >= 1` |

#### 業務ルール

- `title` / `unit_price` は注文確定時に `books` から**値としてコピー**する。参照で解決しない（FR-024）
- 注文内容の表示には必ずスナップショット列を使い、`book_id` から `books` を引き直さない
- 1注文につき同一書籍の明細は1行（カート側で1書籍1行を保証する・FR-009）
- `ON DELETE SET NULL` としているのは、書籍が削除されても注文記録を失わないようにするため

---

## 3. ER 図（HTMLベース）

<!-- plantuml:
@startuml
hide circle
skinparam linetype ortho
entity "books\n（書籍）" as books {
  * id : INT UNSIGNED <<PK>>
  --
  * title : VARCHAR(255)
  * author : VARCHAR(255)
  * price : INT UNSIGNED
  * description : TEXT
    cover_image_url : VARCHAR(512)
  * is_available : BOOLEAN
  * created_at / updated_at
}
entity "orders\n（注文）" as orders {
  * id : INT UNSIGNED <<PK>>
  --
  * order_number : CHAR(26) <<UK>>
  * customer_name : VARCHAR(100)
  * customer_address : VARCHAR(255)
  * customer_email : VARCHAR(255)
  * total_amount : INT UNSIGNED
  * created_at
}
entity "order_items\n（注文明細）" as items {
  * id : INT UNSIGNED <<PK>>
  --
  * order_id : INT UNSIGNED <<FK>>
    book_id : INT UNSIGNED <<FK>>
  * title : VARCHAR(255)
  * unit_price : INT UNSIGNED
  * quantity : INT UNSIGNED
  * subtotal : INT UNSIGNED
}
books ||--o{ items : "ON DELETE SET NULL"
orders ||--|{ items : "ON DELETE CASCADE"
@enduml
-->

<svg viewBox="0 0 940 560" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ER図: books、orders、order_items の主キー・外部キー関係">
  <defs>
    <marker id="crow" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="12" markerHeight="12" orient="auto">
      <path d="M 11 1 L 1 6 L 11 11" fill="none" stroke="#37474f" stroke-width="1.6"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="940" height="560" fill="#ffffff"/>

  <rect x="25" y="60" width="255" height="248" rx="6" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="2"/>
  <rect x="25" y="60" width="255" height="34" rx="6" fill="#6a1b9a"/>
  <text x="152" y="83" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">books（書籍）TBL-001</text>
  <text x="38" y="115" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id                INT UNSIGNED</text>
  <line x1="32" y1="123" x2="273" y2="123" stroke="#ce93d8"/>
  <text x="38" y="142" font-family="monospace" font-size="11.5" fill="#37474f">    title             VARCHAR(255)</text>
  <text x="38" y="160" font-family="monospace" font-size="11.5" fill="#37474f">    author            VARCHAR(255)</text>
  <text x="38" y="178" font-family="monospace" font-size="11.5" fill="#37474f">    price             INT UNSIGNED</text>
  <text x="38" y="196" font-family="monospace" font-size="11.5" fill="#37474f">    description       TEXT</text>
  <text x="38" y="214" font-family="monospace" font-size="11.5" fill="#78909c">    cover_image_url   VARCHAR(512)</text>
  <text x="38" y="232" font-family="monospace" font-size="11.5" font-weight="bold" fill="#4a148c">    is_available      BOOLEAN</text>
  <text x="38" y="254" font-family="monospace" font-size="11" fill="#78909c">    created_at        TIMESTAMP</text>
  <text x="38" y="271" font-family="monospace" font-size="11" fill="#78909c">    updated_at        TIMESTAMP</text>
  <text x="38" y="294" font-family="sans-serif" font-size="10.5" fill="#6a1b9a">INDEX idx_books_is_available</text>

  <rect x="350" y="60" width="255" height="248" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2"/>
  <rect x="350" y="60" width="255" height="34" rx="6" fill="#2e7d32"/>
  <text x="477" y="83" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">order_items（注文明細）TBL-003</text>
  <text x="363" y="115" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id                INT UNSIGNED</text>
  <line x1="357" y1="123" x2="598" y2="123" stroke="#a5d6a7"/>
  <text x="363" y="142" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1b5e20">FK  order_id          INT UNSIGNED</text>
  <text x="363" y="160" font-family="monospace" font-size="11.5" fill="#78909c">FK  book_id           INT UNSIGNED</text>
  <text x="363" y="178" font-family="monospace" font-size="10.5" fill="#78909c">                      （NULL 可）</text>
  <text x="363" y="200" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1b5e20">    title             VARCHAR(255)</text>
  <text x="363" y="218" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1b5e20">    unit_price        INT UNSIGNED</text>
  <text x="363" y="236" font-family="monospace" font-size="10.5" fill="#2e7d32">    ↑ 注文時点のスナップショット</text>
  <text x="363" y="258" font-family="monospace" font-size="11.5" fill="#37474f">    quantity          INT UNSIGNED</text>
  <text x="363" y="276" font-family="monospace" font-size="11.5" fill="#37474f">    subtotal          INT UNSIGNED</text>
  <text x="363" y="298" font-family="sans-serif" font-size="10.5" fill="#2e7d32">CHECK quantity &gt;= 1</text>

  <rect x="675" y="60" width="240" height="248" rx="6" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
  <rect x="675" y="60" width="240" height="34" rx="6" fill="#1565c0"/>
  <text x="795" y="83" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">orders（注文）TBL-002</text>
  <text x="688" y="115" font-family="monospace" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id           INT UNSIGNED</text>
  <line x1="682" y1="123" x2="908" y2="123" stroke="#90caf9"/>
  <text x="688" y="142" font-family="monospace" font-size="11.5" font-weight="bold" fill="#0d3c61">UK  order_number  CHAR(26)</text>
  <text x="688" y="164" font-family="monospace" font-size="11.5" fill="#37474f">    customer_name</text>
  <text x="688" y="182" font-family="monospace" font-size="11.5" fill="#37474f">    customer_address</text>
  <text x="688" y="200" font-family="monospace" font-size="11.5" fill="#37474f">    customer_email</text>
  <text x="688" y="222" font-family="monospace" font-size="11.5" fill="#37474f">    total_amount</text>
  <text x="688" y="244" font-family="monospace" font-size="11" fill="#78909c">    created_at</text>
  <text x="688" y="272" font-family="sans-serif" font-size="10.5" fill="#1565c0">UNIQUE uk_orders_order_number</text>
  <text x="688" y="290" font-family="sans-serif" font-size="10.5" fill="#78909c">updated_at は持たない（追記のみ）</text>

  <line x1="280" y1="170" x2="344" y2="170" stroke="#37474f" stroke-width="1.8" marker-end="url(#crow)"/>
  <text x="312" y="152" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#37474f">1</text>
  <text x="312" y="190" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">0..N</text>
  <text x="312" y="210" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#78909c">SET NULL</text>

  <line x1="669" y1="170" x2="611" y2="170" stroke="#37474f" stroke-width="1.8" marker-end="url(#crow)"/>
  <text x="648" y="152" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#37474f">1</text>
  <text x="636" y="190" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">1..N</text>
  <text x="640" y="210" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#78909c">CASCADE</text>

  <rect x="350" y="370" width="255" height="120" rx="6" fill="#fff8e1" stroke="#c49000" stroke-width="2" stroke-dasharray="7 4"/>
  <rect x="350" y="370" width="255" height="32" rx="6" fill="#c49000"/>
  <text x="477" y="392" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">cart（テーブルなし）</text>
  <text x="363" y="422" font-family="monospace" font-size="11.5" fill="#37474f">bookId / quantity</text>
  <text x="363" y="446" font-family="sans-serif" font-size="10.5" fill="#6d4c00">ブラウザの localStorage に保持</text>
  <text x="363" y="463" font-family="sans-serif" font-size="10.5" fill="#6d4c00">DB テーブルを持たない（FR-016a）</text>
  <text x="363" y="480" font-family="sans-serif" font-size="10.5" fill="#6d4c00">books.id を参照するが DB 上の関連なし</text>

  <path d="M 350 430 L 152 430 L 152 312" fill="none" stroke="#c49000" stroke-width="1.8" stroke-dasharray="6 4"/>
  <text x="165" y="360" font-family="sans-serif" font-size="10.5" fill="#6d4c00">id を参照するのみ</text>
</svg>

### 3.1 リレーション一覧

| # | 親テーブル | 子テーブル | カーディナリティ | 外部キー | ON DELETE | 設計意図 |
|---|---|---|---|---|---|---|
| 1 | `orders` | `order_items` | 1 : 1..N | `order_id` | CASCADE | 注文が消えれば明細も消える（明細は注文に完全従属） |
| 2 | `books` | `order_items` | 1 : 0..N | `book_id` | SET NULL | **書籍が削除されても注文記録を残す**。表示はスナップショット列で行うため参照が切れても支障がない |

---

## 4. DDL（参考）

> ⚠️ 本 DDL は設計確認用の参考情報です。実際の適用は `mysql/init/01_init.sql` を経由し、
> `DROP` / `TRUNCATE` 等の破壊的DDLは記述しないこと（憲法§1参照）。
> **作成順序は外部キーの依存関係に従い `books` → `orders` → `order_items` とすること。**

```sql
-- ============================================================
-- オンライン書店 購買フロー スキーマ
-- 文字コード: utf8mb4 / 照合順序: utf8mb4_unicode_ci
-- ============================================================
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- TBL-001: books（書籍）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  price           INT UNSIGNED NOT NULL,
  description     TEXT         NOT NULL,
  cover_image_url VARCHAR(512) DEFAULT NULL,
  is_available    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_books_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='書籍。初期データとして投入し、アプリケーションからは参照のみ';

-- ------------------------------------------------------------
-- TBL-002: orders（注文）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number     CHAR(26)     NOT NULL,
  customer_name    VARCHAR(100) NOT NULL,
  customer_address VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  total_amount     INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='注文ヘッダ。確定後は更新しない（追記のみ）';

-- ------------------------------------------------------------
-- TBL-003: order_items（注文明細）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id   INT UNSIGNED NOT NULL,
  book_id    INT UNSIGNED DEFAULT NULL,
  title      VARCHAR(255) NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL,
  subtotal   INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_book_id (book_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_order_items_book
    FOREIGN KEY (book_id) REFERENCES books (id)
    ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='注文明細。title / unit_price は注文時点のスナップショット';
```

### 4.1 初期データ（`mysql/init/02_seed.sql`）の要件

| 要件 | 内容 | 根拠 |
|---|---|---|
| 件数 | 全件1画面表示が成立する規模（十数冊程度） | FR-001c / spec.md Assumptions |
| 販売停止の書籍 | **`is_available = FALSE` を1冊以上含める** | FR-001a / FR-005a / FR-016b の検証に必要 |
| 書影なしの書籍 | **`cover_image_url` が NULL のものを1冊以上含める** | Edge Cases（代替表示）の検証に必要 |
| 価格 | 整数円（税込） | research.md D-10 |

---

## 5. 設計上の留意事項

| # | 項目 | 内容 |
|---|---|---|
| 1 | 金額の桁 | `price` / `unit_price` / `subtotal` / `total_amount` は `INT UNSIGNED`（上限 4,294,967,295）。FR-011b が数量の上限を設けないため、極端な数量を投入すると `subtotal` / `total_amount` が桁溢れしうる。`/speckit.analyze` の MEDIUM 指摘 A8 に対応する。<!-- 要確認: 「上限なし」を在庫由来の制限を設けない意味に限定するか、データ型の上限を運用上の上限として要件に明記するか、DB担当者の判断を仰ぐ --> |
| 2 | `subtotal` の冗長性 | `unit_price × quantity` で算出できるが列として保持している。注文記録を単体で読める状態に保つため（監査・問い合わせ対応を想定）。算出値との不一致が生じないよう、INSERT は必ず `calcOrderTotal` の結果を使う |
| 3 | `BOOLEAN` の実体 | MySQL では `TINYINT(1)` として格納される。`mysql2` は `0` / `1` を返すため、アプリ側で真偽値へ変換する |
| 4 | タイムゾーン | `TIMESTAMP` は UTC で格納され、セッションのタイムゾーンで解釈される。<!-- 要確認: コンテナのタイムゾーン設定（既定では UTC）で運用するか、JST に揃えるか未確定 --> |
| 5 | 文字数と `utf8mb4` | `VARCHAR(255)` は**文字数**であり、`utf8mb4` では最大4バイト/文字のため日本語でも255文字格納できる。行サイズ上限には余裕がある |
| 6 | `books` の更新 | 本フィーチャーはアプリから `books` を更新しない。価格変更等は DB 側で直接行う想定（管理画面はスコープ外・FR-001b） |

---

## 6. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | <!-- 要確認: 未記入 --> | | — |
| アーキテクト / テックリード / DB担当 | <!-- 要確認: 未記入 --> | | |
| PM / プロジェクトリーダー | <!-- 要確認: 未記入 --> | | |

> **承認前の留意事項**
> 1. §5 の留意事項1（金額の桁溢れ）と4（タイムゾーン）について、DB担当者の判断が必要。
> 2. 本定義は `mysql/init/01_init.sql` に適用する。雛形のサンプル `users` テーブルを置き換える形になる（T008）。
> 3. `/speckit.analyze` の CRITICAL 1件（憲法§5 — `tech-stack.md` の AI 代行編集が担当者未確定）が未解決である。
