# 詳細設計書 — 個人運営オンライン書店 購買フロー

> **生成元**: /speckit.design detail (AI生成) — 内容を確認の上、承認してから実装を開始すること
> 関連: [憲法 §7](../../.specify/memory/constitution.md) / [基本設計書](basic-design.md) / [plan.md](plan.md) / [tasks.md](tasks.md) / [contracts/](contracts/) / [data-model.md](data-model.md)

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | DETAIL-003 |
| 対象フィーチャー | [`specs/003-bookstore-purchase-flow/`](.) |
| 対象基本設計書 | BASIC-003 |
| 作成日 | 2026-09-04 |
| 作成者 | AI生成（`/speckit.design detail`） |
| 承認者 | （未） |
| 承認日 | （未） |
| バージョン | 1.0 |

---

## 1. 修正対象ファイル一覧

> パスは [plan.md](plan.md) の Structure Decision（Web application: `backend/` + `frontend/` + `mysql/`）に従う。

### 1.1 バックエンド

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `backend/package.json` | 変更 | 依存・スクリプト整備（express/cors/mysql2 + jest/ts-jest/supertest/eslint 系） | T002 |
| `backend/tsconfig.json` | 新規 | `strict: true` | T006 |
| `backend/.eslintrc.json` | 新規 | `@typescript-eslint` recommended | T004 |
| `backend/jest.config.js` | 新規 | `ts-jest` プリセット、`coverageThreshold` 80% | T005 |
| `backend/Dockerfile` | 変更 | development ターゲット確認 | T007 |
| `backend/src/index.ts` | 変更 | `app.ts` を `PORT`（既定4000）で listen | T014 |
| `backend/src/app.ts` | 新規 | Express アプリ組み立て（json / cors / router / 404 / errorHandler）、テスト用に export | T013 |
| `backend/src/config/db.ts` | 新規 | `mysql2/promise` コネクションプール（環境変数から） | T011 |
| `backend/src/middleware/errorHandler.ts` | 新規 | 例外を `{ error, message, fields? }` に整形 | T012 |
| `backend/src/domain/pricing.ts` | 新規 | `lineSubtotal` / `orderTotal`（純関数） | T022 |
| `backend/src/domain/orderNumber.ts` | 新規 | `generateOrderNumber()`（`crypto.randomBytes` + Crockford Base32、26文字、`ORD-` 前置） | T023 |
| `backend/src/domain/orderValidation.ts` | 新規 | `validateOrderRequest(body, foundBooks) → { fields }` | T024 / T047 |
| `backend/src/repositories/bookRepository.ts` | 新規 | `findSellingPage` / `findSellingById` | T021 |
| `backend/src/repositories/orderRepository.ts` | 新規 | `insertOrder(order, items)`（トランザクション） | T026 |
| `backend/src/services/bookService.ts` | 新規 | ページング境界・丸め | T025 |
| `backend/src/services/orderService.ts` | 新規 | 再計算・スナップショット・注文番号発行・永続化のオーケストレーション | T027 |
| `backend/src/routes/books.ts` | 新規 | `GET /api/books` / `GET /api/books/:id` | T028 |
| `backend/src/routes/orders.ts` | 新規 | `POST /api/orders` / `GET /api/orders/:orderNumber` | T029 |
| `backend/tests/unit/*.test.ts` | 新規 | pricing / orderNumber / bookService | T037 |
| `backend/tests/integration/*.test.ts` | 新規 | books / orders-create / orders-validation | T038 / T039 / T048 |

### 1.2 フロントエンド

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `frontend/package.json` | 変更 | 依存・スクリプト整備（next/react + jest/@testing-library/eslint-config-next） | T003 |
| `frontend/tsconfig.json` | 新規/変更 | `strict: true` | T006 |
| `frontend/.eslintrc.json` | 新規 | `next/core-web-vitals` | T004 |
| `frontend/jest.config.js` | 新規 | `next/jest`、`coverageThreshold` 80% | T005 |
| `frontend/Dockerfile` | 変更 | development ターゲット確認 | T007 |
| `frontend/app/globals.css` | 新規 | 共有 CSS 変数（色・間隔・フォント） | T018 |
| `frontend/app/layout.tsx` | 新規 | 共通レイアウト＋ヘッダ導線 | T018 |
| `frontend/app/page.tsx` | 新規 | SCR-001 商品一覧（`?page=`） | T031 |
| `frontend/app/books/[id]/page.tsx` | 新規 | SCR-002 商品詳細 | T032 |
| `frontend/app/cart/page.tsx` | 新規 | SCR-003 カート（基本→US2で拡張） | T034 / T043 |
| `frontend/app/checkout/page.tsx` | 新規 | SCR-004 注文フォーム | T035 |
| `frontend/app/order-complete/page.tsx` | 新規 | SCR-005 注文完了 | T036 |
| `frontend/components/BookCard.tsx` `BookGrid.tsx` | 新規 | 一覧カード・グリッド | T030 |
| `frontend/components/Pagination.tsx` | 新規 | 前/次/先頭/末尾/現在ページ | T031 |
| `frontend/components/OrderSummary.tsx` | 新規 | カート行＋合計（カート・注文フォーム共用） | T033 |
| `frontend/components/QuantityStepper.tsx` | 新規 | 数量増減（下限1・上限99） | T041 |
| `frontend/components/CheckoutForm.tsx` | 新規 | 3項目入力＋項目別エラー | T035 / T046 |
| `frontend/components/ErrorNotice.tsx` `EmptyState.tsx` | 新規 | 汎用エラー・空状態 | T019 / T020 |
| `frontend/lib/api.ts` | 新規 | fetch ラッパ、`ApiError` 正規化 | T015 |
| `frontend/lib/cart.ts` | 新規 | `localStorage` カート操作 | T016 / T042 |
| `frontend/lib/cartTotal.ts` | 新規 | 小計・合計（純関数） | T017 |
| `frontend/lib/validation.ts` | 新規 | 送信時バリデーション（純関数） | T045 |
| `frontend/public/images/books/placeholder.svg` | 新規 | 書影プレースホルダ | T010b |
| `frontend/tests/**/*.test.ts(x)` | 新規 | cart / cartTotal / validation / CheckoutForm / cart-page / checkout-page | T040 / T040b / T044 / T049 |

### 1.3 DB / その他

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `mysql/init/001_schema.sql` | 新規 | `books` / `orders` / `order_items` の CREATE＋インデックス | T009 |
| `mysql/init/002_seed_books.sql` | 新規 | 書籍 20〜30 件（`selling` 中心＋`unlisted` 数件）、`cover_image_url` は placeholder 統一 | T010 |
| `docker-compose.yml` | 変更 | backend に `FRONTEND_ORIGIN` 追加 | T008 |
| ルート `package.json` | 新規（方針次第） | 両サブパッケージの lint 集約（`quality-gate.yml` 対応） | T054 |

---

## 2. モジュール詳細

### 2.1 `backend/src/domain/orderNumber.ts`

#### 処理概要

注文番号を生成する純粋関数。48bit のミリ秒タイムスタンプ＋80bit の乱数を 128bit にまとめ、Crockford Base32 で 26 文字にエンコードし、`ORD-` を前置する。外部ライブラリ不使用（`crypto` のみ）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `generateOrderNumber(now?: number)` | 関数 | `"ORD-" + <26文字 Base32>` を返す。`now` はテスト用に注入可能 |
| `encodeCrockfordBase32(bytes: Buffer)` | 関数(内部) | 16バイトを 26 文字の Base32（`0-9A-HJKMNP-TV-Z`）へ |

#### シーケンス図（UML: シーケンス図）

<!-- plantuml:
@startuml
participant caller
participant generateOrderNumber as gen
participant "crypto.randomBytes" as rnd
caller -> gen : generateOrderNumber()
gen -> gen : ts = Date.now() (48bit, big-endian)
gen -> rnd : randomBytes(10)
rnd --> gen : 80bit 乱数
gen -> gen : buf = ts(6B) + rand(10B)
gen -> gen : encodeCrockfordBase32(buf)
gen --> caller : "ORD-01J....(26)"
@enduml
-->

<div style="font-family:system-ui,sans-serif;">
<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="orderNumber シーケンス図">
  <style>
    .life{stroke:#94a3b8;stroke-width:1;stroke-dasharray:4 3;}
    .act{fill:#eef2ff;stroke:#6366f1;}
    .m{stroke:#334155;stroke-width:1.3;fill:none;marker-end:url(#am);}
    .tt{font-size:11px;fill:#0f172a;font-family:system-ui;}
    .hd{font-size:12px;fill:#0f172a;font-weight:bold;font-family:system-ui;}
  </style>
  <defs><marker id="am" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#334155"/></marker></defs>
  <text x="70" y="20" text-anchor="middle" class="hd">caller</text>
  <text x="300" y="20" text-anchor="middle" class="hd">generateOrderNumber</text>
  <text x="560" y="20" text-anchor="middle" class="hd">crypto.randomBytes</text>
  <line x1="70" y1="28" x2="70" y2="220" class="life"/>
  <line x1="300" y1="28" x2="300" y2="220" class="life"/>
  <line x1="560" y1="28" x2="560" y2="220" class="life"/>
  <line x1="70" y1="50" x2="298" y2="50" class="m"/><text x="80" y="45" class="tt">generateOrderNumber()</text>
  <rect x="292" y="50" width="16" height="140" class="act"/>
  <text x="315" y="78" class="tt">ts = Date.now() を 6バイト(big-endian)へ</text>
  <line x1="308" y1="95" x2="558" y2="95" class="m"/><text x="330" y="90" class="tt">randomBytes(10)</text>
  <line x1="558" y1="115" x2="310" y2="115" class="m"/><text x="330" y="110" class="tt">80bit 乱数</text>
  <text x="315" y="140" class="tt">buf = ts(6B) + rand(10B) → Base32(26)</text>
  <line x1="292" y1="185" x2="72" y2="185" class="m"/><text x="90" y="180" class="tt">"ORD-01J…"（26文字）</text>
</svg>
</div>

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `now` | number | 任意 | エポックミリ秒。省略時 `Date.now()` | 正の整数（テスト時のみ指定） |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| 戻り値 | string | `^ORD-[0-9A-HJKMNP-TV-Z]{26}$` | 時刻プレフィックスにより概ね時系列昇順 |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `crypto` 例外（極めて稀） | — | 例外を送出。呼び出し元（`orderService`）が最大3回リトライし、超過で `INTERNAL_ERROR` |

---

### 2.2 `backend/src/domain/pricing.ts`

#### 処理概要

金額計算の純粋関数群。整数円のみを扱い、丸めは発生しない。フロント `lib/cartTotal.ts` と同一規則（SC-006）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `lineSubtotal(unitPrice: number, quantity: number): number` | 関数 | `unitPrice * quantity` |
| `orderTotal(items: {unitPrice:number; quantity:number}[]): number` | 関数 | Σ `lineSubtotal` |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `unitPrice` | number | ✅ | 単価（円・非負整数） | 呼び出し元で検証済みの前提。負値・非整数は NaN 汚染を避けるためガード（0 未満は 0 扱いにせず例外） |
| `quantity` | number | ✅ | 数量（1..99 整数） | 同上 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| 戻り値 | number | 小計 / 合計（整数） | オーバーフローは実務上非現実的（上限 99 × 数十件） |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `unitPrice`/`quantity` が非有限・負・非整数 | — | `TypeError` を送出（`orderService` 到達前に `orderValidation` で弾く想定） |

---

### 2.3 `backend/src/domain/orderValidation.ts`

#### 処理概要

注文リクエストの検証。`customer` 3項目と `items` を検査し、`fields`（`name`/`address`/`email`/`items`）に日本語メッセージを積む。副作用なし。DB 実在チェックは呼び出し元が取得した `foundBooks` を渡して判定する。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `validateOrderRequest(body, foundBooks): { fields: Record<string,string> }` | 関数 | 検証結果。`fields` が空なら妥当 |
| `isValidEmail(v: string): boolean` | 関数(内部) | 共有正規表現（前後端で同仕様） |
| `EMAIL_PATTERN` | 定数 | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`（実用サブセット） |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `body.customer.name` | string | ✅ | 氏名 | トリム後 1..255。空/空白のみ → `fields.name` |
| `body.customer.address` | string | ✅ | 住所 | トリム後 1..1000 → `fields.address` |
| `body.customer.email` | string | ✅ | メール | 1..255＋`EMAIL_PATTERN` → `fields.email` |
| `body.items` | array | ✅ | 明細 | 1件以上 → `fields.items` |
| `body.items[].bookId` | number | ✅ | 書籍ID | 整数、`foundBooks` に存在し `status='selling'` |
| `body.items[].quantity` | number | ✅ | 数量 | 整数 1..99 |
| `foundBooks` | `Map<number, Book>` | ✅ | 呼び出し元が `bookRepository` で取得した現在値 | — |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `fields` | object | 違反項目→メッセージ。空 `{}` で妥当 | 金額フィールド（`unitPrice` 等）は無視 |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `body` が非オブジェクト / `customer` 欠落 | `VALIDATION_ERROR` | ルート層で 400（`fields` に該当キー） |
| 1件以上の `fields` | `VALIDATION_ERROR` | `orderService` は DB 書き込みを行わず 400 を返す |

---

### 2.4 `backend/src/services/bookService.ts`

#### 処理概要

一覧のページング境界を扱う。`pageSize` 既定 12・範囲 1..48（外は 400）、`page` 既定 1、`page > totalPages` は最終ページへ丸めて実際の `page` を返す。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `listSellingBooks(query): Promise<BooksListResponse>` | 関数 | `bookRepository.findSellingPage` を呼び、レスポンス整形 |
| `getSellingBook(id): Promise<BookDetail>` | 関数 | `findSellingById`。無ければ `NotFoundError` |

#### シーケンス図（UML: シーケンス図）

<!-- plantuml:
@startuml
actor Client
participant "routes/books.ts" as R
participant "bookService" as S
participant "bookRepository" as Repo
database MySQL
Client -> R : GET /api/books?page=999&pageSize=12
R -> S : listSellingBooks({page:999, pageSize:12})
S -> S : clamp pageSize (1..48) / page>=1
S -> Repo : findSellingPage(page=999, size=12)
Repo -> MySQL : SELECT ... WHERE status='selling' ORDER BY id LIMIT ? OFFSET ?
MySQL --> Repo : rows(0件)
Repo -> MySQL : SELECT COUNT(*) WHERE status='selling'
MySQL --> Repo : totalItems=25
Repo --> S : {rows:[], totalItems:25}
S -> S : totalPages=ceil(25/12)=3 ; page>3 → 再取得(page=3)
S -> Repo : findSellingPage(page=3, size=12)
Repo -> MySQL : SELECT ... LIMIT 12 OFFSET 24
MySQL --> Repo : rows(1件)
Repo --> S : {rows:[...1], totalItems:25}
S --> R : {items:[...], page:3, pageSize:12, totalItems:25, totalPages:3}
R --> Client : 200 OK
@enduml
-->

<div style="font-family:system-ui,sans-serif;">
<svg viewBox="0 0 860 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="一覧ページング シーケンス図">
  <defs><marker id="bm" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#334155"/></marker></defs>
  <style>
    .l{stroke:#94a3b8;stroke-width:1;stroke-dasharray:4 3;}
    .mm{stroke:#334155;stroke-width:1.2;fill:none;marker-end:url(#bm);}
    .x{font-size:10.5px;fill:#0f172a;font-family:system-ui;}
    .h{font-size:11.5px;fill:#0f172a;font-weight:bold;font-family:system-ui;}
    .a{fill:#eef2ff;stroke:#6366f1;}
  </style>
  <text x="60" y="16" class="h">Client</text>
  <text x="220" y="16" class="h">routes/books</text>
  <text x="400" y="16" class="h">bookService</text>
  <text x="580" y="16" class="h">bookRepository</text>
  <text x="770" y="16" class="h">MySQL</text>
  <line x1="60" y1="22" x2="60" y2="315" class="l"/>
  <line x1="220" y1="22" x2="220" y2="315" class="l"/>
  <line x1="400" y1="22" x2="400" y2="315" class="l"/>
  <line x1="580" y1="22" x2="580" y2="315" class="l"/>
  <line x1="770" y1="22" x2="770" y2="315" class="l"/>

  <line x1="60" y1="42" x2="218" y2="42" class="mm"/><text x="66" y="37" class="x">GET /api/books?page=999&pageSize=12</text>
  <line x1="220" y1="66" x2="398" y2="66" class="mm"/><text x="226" y="61" class="x">listSellingBooks(...)</text>
  <text x="404" y="86" class="x">clamp pageSize(1..48), page&gt;=1</text>
  <line x1="400" y1="100" x2="578" y2="100" class="mm"/><text x="406" y="95" class="x">findSellingPage(999,12)</text>
  <line x1="580" y1="120" x2="768" y2="120" class="mm"/><text x="586" y="115" class="x">SELECT … LIMIT ? OFFSET ?</text>
  <line x1="768" y1="140" x2="582" y2="140" class="mm"/><text x="600" y="135" class="x">rows: 0件</text>
  <line x1="580" y1="158" x2="768" y2="158" class="mm"/><text x="586" y="153" class="x">SELECT COUNT(*) status='selling'</text>
  <line x1="768" y1="176" x2="582" y2="176" class="mm"/><text x="600" y="171" class="x">totalItems = 25</text>
  <line x1="580" y1="194" x2="402" y2="194" class="mm"/><text x="410" y="189" class="x">{rows:[], totalItems:25}</text>
  <text x="404" y="214" class="x">totalPages=ceil(25/12)=3 → page&gt;3 なので page=3 で再取得</text>
  <line x1="400" y1="228" x2="578" y2="228" class="mm"/><text x="406" y="223" class="x">findSellingPage(3,12)</text>
  <line x1="580" y1="246" x2="768" y2="246" class="mm"/><text x="586" y="241" class="x">SELECT … LIMIT 12 OFFSET 24</text>
  <line x1="768" y1="264" x2="402" y2="264" class="mm"/><text x="470" y="259" class="x">rows: 1件 / totalItems: 25</text>
  <line x1="400" y1="284" x2="222" y2="284" class="mm"/><text x="228" y="279" class="x">{items, page:3, pageSize:12, totalItems:25, totalPages:3}</text>
  <line x1="220" y1="304" x2="62" y2="304" class="mm"/><text x="70" y="299" class="x">200 OK</text>
</svg>
</div>

#### パラメータ定義

**入力（Input）** — `listSellingBooks`

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `query.page` | number | 任意 | ページ番号（1始まり） | 整数、`>=1`。非整数は 400 |
| `query.pageSize` | number | 任意 | 1ページ件数 | 整数、1..48。範囲外は 400 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `items` | `BookSummary[]` | `id/title/author/price/coverImageUrl`。`description` 除外 | 0件は `[]` |
| `page` | number | 丸め後の実ページ | — |
| `pageSize` | number | 適用値 | — |
| `totalItems` | number | 販売中総数 | — |
| `totalPages` | number | `ceil(totalItems/pageSize)`、0件なら 0 | — |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `pageSize` 範囲外 / `page`・`pageSize` 非整数 | `VALIDATION_ERROR` | 400 |
| `getSellingBook` で該当なし or `unlisted` | `NOT_FOUND` | 404 |
| DB 例外 | `INTERNAL_ERROR` | 500（フロントは汎用エラー表示） |

---

### 2.5 `backend/src/services/orderService.ts`

#### 処理概要

注文作成のユースケースを統括。`bookRepository` で `items` の書籍現在値を取得 → `orderValidation` → `pricing` で `subtotal`/`total` をサーバ再計算 → `title_snapshot`/`unit_price_snapshot` 生成 → `orderNumber` 発行（重複時最大3回リトライ）→ `orderRepository.insertOrder`（単一トランザクション）。クライアントが送る金額は使わない（D-08）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `createOrder(body): Promise<OrderResponse>` | 関数 | 上記フローの実行 |
| `findOrderByNumber(orderNumber): Promise<OrderResponse>` | 関数 | 補助照会。無ければ `NotFoundError` |

#### シーケンス図（UML: シーケンス図）

<!-- plantuml:
@startuml
actor Client
participant "routes/orders.ts" as R
participant "orderService" as S
participant "bookRepository" as BR
participant "orderValidation" as V
participant "pricing" as P
participant "orderNumber" as N
participant "orderRepository" as OR
database MySQL
Client -> R : POST /api/orders {customer, items}
R -> S : createOrder(body)
S -> BR : findSellingByIds([bookId...])
BR -> MySQL : SELECT ... WHERE id IN (?) AND status='selling'
MySQL --> BR : books
BR --> S : Map<id, Book>
S -> V : validateOrderRequest(body, foundBooks)
V --> S : { fields }
alt fields が空でない
  S --> R : ValidationError(fields)
  R --> Client : 400 {error, fields}
else 妥当
  S -> P : orderTotal(items with server unitPrice)
  P --> S : totalAmount, 各 subtotal
  S -> N : generateOrderNumber()
  N --> S : "ORD-…"
  S -> OR : insertOrder(order, items)  ' BEGIN
  OR -> MySQL : INSERT INTO orders (...)
  OR -> MySQL : INSERT INTO order_items (...) x N
  MySQL --> OR : ok
  OR --> S : orderId  ' COMMIT
  S --> R : OrderResponse
  R --> Client : 201 {orderNumber, totalAmount, items[...]}
end
@enduml
-->

<div style="font-family:system-ui,sans-serif;overflow-x:auto;">
<svg viewBox="0 0 980 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="注文作成 シーケンス図">
  <defs><marker id="cm" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#334155"/></marker></defs>
  <style>
    .l2{stroke:#94a3b8;stroke-width:1;stroke-dasharray:4 3;}
    .m2{stroke:#334155;stroke-width:1.15;fill:none;marker-end:url(#cm);}
    .r2{stroke:#64748b;stroke-width:1.1;fill:none;marker-end:url(#cm);stroke-dasharray:5 3;}
    .z{font-size:10px;fill:#0f172a;font-family:system-ui;}
    .hh{font-size:10.5px;fill:#0f172a;font-weight:bold;font-family:system-ui;}
    .alt{fill:none;stroke:#f59e0b;stroke-width:1;stroke-dasharray:3 2;}
  </style>
  <g class="hh">
    <text x="50" y="14">Client</text><text x="150" y="14">routes/orders</text><text x="290" y="14">orderService</text>
    <text x="430" y="14">bookRepo</text><text x="540" y="14">validation</text><text x="650" y="14">pricing</text>
    <text x="740" y="14">orderNumber</text><text x="850" y="14">orderRepo</text><text x="940" y="14">MySQL</text>
  </g>
  <g class="l2">
    <line x1="50" y1="20" x2="50" y2="460"/><line x1="170" y1="20" x2="170" y2="460"/><line x1="310" y1="20" x2="310" y2="460"/>
    <line x1="440" y1="20" x2="440" y2="460"/><line x1="555" y1="20" x2="555" y2="460"/><line x1="660" y1="20" x2="660" y2="460"/>
    <line x1="765" y1="20" x2="765" y2="460"/><line x1="860" y1="20" x2="860" y2="460"/><line x1="950" y1="20" x2="950" y2="460"/>
  </g>
  <line x1="50" y1="40" x2="168" y2="40" class="m2"/><text x="54" y="35" class="z">POST /api/orders {customer, items}</text>
  <line x1="170" y1="60" x2="308" y2="60" class="m2"/><text x="174" y="55" class="z">createOrder(body)</text>
  <line x1="310" y1="82" x2="438" y2="82" class="m2"/><text x="314" y="77" class="z">findSellingByIds([...])</text>
  <line x1="440" y1="102" x2="948" y2="102" class="m2"/><text x="444" y="97" class="z">SELECT … id IN (?) AND status='selling'</text>
  <line x1="948" y1="120" x2="442" y2="120" class="r2"/><text x="470" y="115" class="z">books</text>
  <line x1="440" y1="138" x2="312" y2="138" class="r2"/><text x="316" y="133" class="z">Map&lt;id, Book&gt;</text>
  <line x1="310" y1="158" x2="553" y2="158" class="m2"/><text x="314" y="153" class="z">validateOrderRequest(body, foundBooks)</text>
  <line x1="553" y1="176" x2="312" y2="176" class="r2"/><text x="316" y="171" class="z">{ fields }</text>

  <rect x="300" y="188" width="470" height="70" class="alt"/>
  <text x="306" y="200" class="z" style="fill:#b45309;">alt [fields が空でない] → 400 / else 妥当 ↓</text>
  <line x1="310" y1="214" x2="172" y2="214" class="r2"/><text x="176" y="209" class="z">ValidationError(fields)</text>
  <line x1="170" y1="232" x2="52" y2="232" class="r2"/><text x="56" y="227" class="z">400 {error, fields}</text>

  <line x1="310" y1="278" x2="658" y2="278" class="m2"/><text x="314" y="273" class="z">orderTotal(items, server unitPrice)</text>
  <line x1="658" y1="296" x2="312" y2="296" class="r2"/><text x="316" y="291" class="z">totalAmount, subtotal[]</text>
  <line x1="310" y1="314" x2="763" y2="314" class="m2"/><text x="314" y="309" class="z">generateOrderNumber()</text>
  <line x1="763" y1="332" x2="312" y2="332" class="r2"/><text x="316" y="327" class="z">"ORD-…"</text>
  <line x1="310" y1="350" x2="858" y2="350" class="m2"/><text x="314" y="345" class="z">insertOrder(order, items)  BEGIN</text>
  <line x1="860" y1="368" x2="948" y2="368" class="m2"/><text x="864" y="363" class="z">INSERT orders</text>
  <line x1="860" y1="386" x2="948" y2="386" class="m2"/><text x="864" y="381" class="z">INSERT order_items × N</text>
  <line x1="948" y1="404" x2="862" y2="404" class="r2"/><text x="880" y="399" class="z">ok</text>
  <line x1="858" y1="422" x2="312" y2="422" class="r2"/><text x="330" y="417" class="z">orderId  COMMIT</text>
  <line x1="310" y1="440" x2="172" y2="440" class="r2"/><text x="176" y="435" class="z">OrderResponse</text>
  <line x1="170" y1="458" x2="52" y2="458" class="r2"/><text x="56" y="453" class="z">201 {orderNumber, totalAmount, items[…]}</text>
</svg>
</div>

#### パラメータ定義

**入力（Input）** — `createOrder`

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `body.customer.name/address/email` | string | ✅ | 注文者情報 | `orderValidation` 参照 |
| `body.items[].bookId` | number | ✅ | 書籍ID | 実在・`selling` |
| `body.items[].quantity` | number | ✅ | 数量 | 1..99 整数 |
| （`unitPrice` / `totalAmount` 等が来ても） | — | — | サーバは無視 | — |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `orderNumber` | string | `ORD-` + 26文字 | UNIQUE |
| `orderedAt` | string(ISO 8601) | 確定日時（UTC） | `orders.ordered_at` |
| `customer` | object | トリム後の注文者情報 | — |
| `items[]` | array | `bookId/title/unitPrice/quantity/subtotal`（スナップショット） | — |
| `totalAmount` | number | Σ `subtotal` | 送料なし |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `orderValidation` の `fields` が非空 | `VALIDATION_ERROR` | 400（DB 書き込みなし） |
| `bookId` が実在しない / `unlisted` | `VALIDATION_ERROR` | 400（`fields.items`） |
| 注文番号が3回連続で重複（UNIQUE 違反） | `INTERNAL_ERROR` | 500・ロールバック |
| `INSERT` 途中失敗 | `INTERNAL_ERROR` | 500・トランザクション全体ロールバック |

---

### 2.6 `backend/src/repositories/orderRepository.ts`

#### 処理概要

`orders` と `order_items` の書き込みを単一トランザクションで行う。プレースホルダ必須。破壊的 DDL は扱わない。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `insertOrder(order, items): Promise<number>` | 関数 | `BEGIN → INSERT orders → INSERT order_items×N → COMMIT`。失敗時 `ROLLBACK` |
| `findByOrderNumber(orderNumber): Promise<OrderRow | null>` | 関数 | `orders` + `order_items` を JOIN 取得 |

#### パラメータ定義

**入力（Input）** — `insertOrder`

| パラメータ名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `order.orderNumber` | string | ✅ | `ORD-…` |
| `order.customerName/Address/Email` | string | ✅ | トリム済み |
| `order.totalAmount` | number | ✅ | サーバ算出 |
| `items[].bookId` | number \| null | ✅ | FK（存在すれば数値） |
| `items[].titleSnapshot` | string | ✅ | 注文時点の書名 |
| `items[].unitPriceSnapshot` | number | ✅ | 注文時点の単価 |
| `items[].quantity` | number | ✅ | 1..99 |
| `items[].subtotal` | number | ✅ | `unitPriceSnapshot * quantity` |

**出力（Output）**

| パラメータ名 | 型 | 説明 |
|---|---|---|
| 戻り値 | number | 生成された `orders.id`（内部用、API 非公開） |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `orders.order_number` UNIQUE 違反 | （呼び出し元へ送出） | `orderService` がリトライ判定 |
| コネクション/SQL 例外 | `INTERNAL_ERROR` | `ROLLBACK` 後に送出 → 500 |

---

### 2.7 `frontend/lib/cart.ts`

#### 処理概要

`localStorage`（キー `bookstore.cart.v1`）にカートを JSON 保存する。SSR 非対応のためクライアントコンポーネントからのみ使用。破損 JSON は空カートにフォールバック。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 | 対応タスク |
|---|---|---|---|
| `readCart(): CartItem[]` | 関数 | 読み出し（破損時 `[]`） | T016 |
| `addItem(bookId: number): void` | 関数 | 既存なら `quantity+1`、無ければ `{bookId, quantity:1}`（CL-002） | T016 |
| `clear(): void` | 関数 | 全削除（注文成功後 / CL-004） | T016 |
| `setQuantity(bookId, q): void` | 関数 | `q` を 1..99 にクランプして更新 | T042 |
| `removeItem(bookId): void` | 関数 | 明細を削除 | T042 |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `bookId` | number | ✅ | 対象書籍ID | 正の整数 |
| `q`（`setQuantity`） | number | ✅ | 変更後の数量 | 1..99 にクランプ（範囲外入力を丸める） |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `readCart` 戻り値 | `CartItem[]` | `{ bookId, quantity }` の配列 | 表示時に一覧/詳細 API の `price`/`title` を突き合わせる |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `JSON.parse` 失敗 / 型不一致 | — | `[]` を返し、`localStorage` を初期化 |
| `localStorage` 使用不可（プライベートモード等） | — | メモリ内フォールバック（当該セッションのみ保持）。`<!-- 要確認: フォールバック挙動の許容範囲 -->` |

---

### 2.8 `frontend/lib/api.ts`

#### 処理概要

バックエンド REST クライアント。ベース URL は `process.env.NEXT_PUBLIC_API_URL`。非2xx・ネットワーク失敗を `ApiError`（`status`, `code`, `fields?`）に正規化する。呼び出し側は `POST /api/orders` の 400 のみ `fields` を利用し、それ以外は `ErrorNotice` を表示（D-12 / FR-032）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `getBooks(page, pageSize): Promise<BooksListResponse>` | 関数 | `GET /api/books` |
| `getBook(id): Promise<BookDetail>` | 関数 | `GET /api/books/:id` |
| `createOrder(payload): Promise<OrderResponse>` | 関数 | `POST /api/orders` |
| `getOrder(orderNumber): Promise<OrderResponse>` | 関数 | `GET /api/orders/:orderNumber`（補助） |
| `class ApiError extends Error` | クラス | `status:number`, `code:string`, `fields?:Record<string,string>` |

#### エラー処理

| エラー条件 | `ApiError.code` | 画面側の扱い |
|---|---|---|
| ネットワーク失敗 / タイムアウト | `NETWORK` | `ErrorNotice`（定型文） |
| 400（注文） | `VALIDATION_ERROR` | `CheckoutForm` が `fields` を項目別表示 |
| 404 | `NOT_FOUND` | 詳細画面は「見つかりません」＋一覧へ、他は `ErrorNotice` |
| 500 | `INTERNAL_ERROR` | `ErrorNotice` |

---

### 2.9 `frontend/components/CheckoutForm.tsx`

#### 処理概要

氏名・住所・メールの入力と注文サマリ表示。送信時に `lib/validation.ts` を実行し、NG なら項目別エラーを表示して送信しない。OK なら `api.createOrder` を呼び、成功時に `cart.clear()` → `/order-complete` へ遷移（注文番号を引き渡す）。サーバ 400 の `fields` を各入力欄へマッピング。

#### パラメータ定義

**入力（Props / フォーム状態）**

| 名称 | 型 | 必須 | 説明 | バリデーション（送信時） |
|---|---|---|---|---|
| `name` | string | ✅ | 氏名 | 非空・トリム後 1..255 |
| `address` | string | ✅ | 住所 | 非空・トリム後 1..1000 |
| `email` | string | ✅ | メール | `EMAIL_PATTERN`・1..255 |
| `items`（カート由来） | `CartItem[]` | ✅ | 注文明細 | 1件以上（空なら送信不可＝FR-016/Edge） |

**出力（画面遷移 / 副作用）**

| 事象 | 結果 |
|---|---|
| 検証OK＋201 | `cart.clear()` → `/order-complete?number=<orderNumber>`（または state 経由） |
| 検証NG（クライアント） | 各欄に `aria-invalid` とメッセージ。送信しない |
| サーバ400 | `fields` を対応欄へ表示 |
| その他エラー | `ErrorNotice` |

#### エラー処理

| エラー条件 | 表示 |
|---|---|
| `name`/`address`/`email` の未入力・形式不正 | 該当欄にメッセージ（`fields` キーに対応） |
| カートが空 | 「カートが空です」。`/checkout` 直アクセス時も同様（Edge Cases、T040b） |
| 通信失敗 | `ErrorNotice`（再試行ボタンなし） |

---

## 3. API 詳細仕様

> [`contracts/`](contracts/) と整合。ここでは要点のみ。全項目は各契約書を正とする。

### 3.1 GET /api/books

| 項目 | 内容 |
|---|---|
| 説明 | 販売中書籍のページング一覧（[books-list.md](contracts/books-list.md)） |
| 認証 | 不要 |

**リクエスト**: クエリ `page`（既定1）, `pageSize`（既定12, 1..48）

**レスポンス（正常 200）**

```json
{ "items": [ { "id": 1, "title": "…", "author": "…", "price": 780, "coverImageUrl": "/images/books/placeholder.svg" } ],
  "page": 1, "pageSize": 12, "totalItems": 25, "totalPages": 3 }
```

**レスポンス（エラー）**

| HTTP | code | 説明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `pageSize` 範囲外、`page`/`pageSize` 非整数 |
| 500 | `INTERNAL_ERROR` | DB 例外 |

### 3.2 GET /api/books/:id

| 項目 | 内容 |
|---|---|
| 説明 | 書籍詳細（説明文含む、[books-detail.md](contracts/books-detail.md)） |
| 認証 | 不要 |

**レスポンス（正常 200）**: `{ id, title, author, price, coverImageUrl, description }`

**レスポンス（エラー）**

| HTTP | code | 説明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `id` 非整数 |
| 404 | `NOT_FOUND` | 非実在 or `status='unlisted'` |
| 500 | `INTERNAL_ERROR` | DB 例外 |

### 3.3 POST /api/orders

| 項目 | 内容 |
|---|---|
| 説明 | 注文作成（[orders-create.md](contracts/orders-create.md)）。サーバ再計算・スナップショット・注文番号発行 |
| 認証 | 不要 |

**リクエスト**

```json
{ "customer": { "name": "山田 太郎", "address": "東京都…", "email": "taro@example.com" },
  "items": [ { "bookId": 1, "quantity": 2 } ] }
```

**レスポンス（正常 201）**

```json
{ "orderNumber": "ORD-01J9Z8K3QN7YB4M2T0V1XRE9AF", "orderedAt": "2026-09-04T…Z",
  "customer": { "name": "山田 太郎", "address": "東京都…", "email": "taro@example.com" },
  "items": [ { "bookId": 1, "title": "…", "unitPrice": 780, "quantity": 2, "subtotal": 1560 } ],
  "totalAmount": 1560 }
```

**レスポンス（エラー）**

| HTTP | code | 説明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `fields` に `name`/`address`/`email`/`items` の内訳。注文は作成されない |
| 500 | `INTERNAL_ERROR` | トランザクション失敗、注文番号採番3回失敗 |

### 3.4 GET /api/orders/:orderNumber（補助）

| 項目 | 内容 |
|---|---|
| 説明 | 注文番号での照会。`POST` の 201 と同一構造（SC-007 支援） |
| 認証 | 不要 |

| HTTP | code | 説明 |
|---|---|---|
| 404 | `NOT_FOUND` | 該当注文なし |

---

## 4. DB 操作詳細

> テーブル定義は [table-definition.md](table-definition.md)（`/speckit.design table` 生成）を参照。破壊的 DDL（`DROP`/`TRUNCATE`）は生成・実行しない（憲法§1）。全クエリはプレースホルダ（`?`）を使用（`tech-stack.md` §8）。

| 操作 | 対象テーブル | SQL 概要 | トランザクション |
|---|---|---|---|
| SELECT | `books` | `SELECT id,title,author,price,cover_image_url FROM books WHERE status='selling' ORDER BY id LIMIT ? OFFSET ?` | 不要 |
| SELECT | `books` | `SELECT COUNT(*) FROM books WHERE status='selling'`（`totalItems`） | 不要 |
| SELECT | `books` | `SELECT ... FROM books WHERE id=? AND status='selling'`（詳細） | 不要 |
| SELECT | `books` | `SELECT id,title,price,status FROM books WHERE id IN (?)`（注文時の現在値取得） | 不要（`createOrder` 冒頭） |
| INSERT | `orders` | `INSERT INTO orders (order_number, customer_name, customer_address, customer_email, total_amount, ordered_at) VALUES (?,?,?,?,?,?)` | ✅ `createOrder` の単一トランザクション |
| INSERT | `order_items` | `INSERT INTO order_items (order_id, book_id, title_snapshot, unit_price_snapshot, quantity, subtotal) VALUES ?`（複数行） | ✅ 同上 |
| SELECT | `orders` ⋈ `order_items` | `SELECT ... FROM orders o JOIN order_items i ON i.order_id=o.id WHERE o.order_number=?`（補助照会） | 不要 |

- **UPDATE / DELETE は本機能では発生しない**（注文の変更・キャンセルはスコープ外、書籍編集もスコープ外）。カート操作は `localStorage` のみで DB を触らない。
- `order_items` の複数行 INSERT は `mysql2` のバルク（`VALUES ?` に二次元配列）を用いる。

---

## 5. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | | | — |
| アーキテクト / テックリード | | | |
| PM / プロジェクトリーダー | | | |

<!-- 要確認: (1) localStorage 使用不可時のメモリ内フォールバックを許容するか。(2) ルート package.json 集約 vs quality-gate.yml 調整の方針（T054）。(3) tech-stack.md への AI 代行記入分（テストFW/CSS方針/却下選択肢）の人間による最終確定。 -->
