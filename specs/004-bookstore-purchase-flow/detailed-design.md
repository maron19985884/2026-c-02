# 詳細設計書 — オンライン書店の購買フロー

> **生成元**: /speckit.design detail (AI生成) — 内容を確認の上、承認してから実装を開始すること

> **図の表示について**: 憲法§7 に従い、すべての図はインライン SVG（HTML）で記述している。
> GitHub の Markdown ビューアはインライン SVG を除去するため、ローカルのプレビューで閲覧すること。
> 再生成用の PlantUML 記法を `<!-- plantuml: ... -->` としてコメントで併記している。

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | DETAIL-004 |
| 対象フィーチャー | [`specs/004-bookstore-purchase-flow/`](./spec.md) |
| 対象基本設計書 | [BASIC-004](./basic-design.md) |
| 作成日 | 2026-09-15 |
| 作成者 | AI生成（`/speckit.design detail`） |
| 承認者 | <!-- 要確認: 承認者未定 --> |
| 承認日 | <!-- 要確認: 未承認 --> |
| バージョン | 1.0 |

**関連ドキュメント**: [tasks.md](./tasks.md) / [contracts/](./contracts/) / [data-model.md](./data-model.md) / [research.md](./research.md)

---

## 1. 修正対象ファイル一覧

> [plan.md](./plan.md) の Structure Decision（Option 2: frontend + backend）に記載された構造に従う。
> 「変更」は `origin/main` の雛形が既に存在するファイル、「新規」は本フィーチャーで追加するファイル。
> **削除するファイルはない**（憲法§1 の破壊的操作を避ける方針）。

### 1.1 バックエンド

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `backend/package.json` | 変更 | ESLint・Jest の開発依存と `lint` / `test` スクリプトを追加 | T003, T005 |
| `backend/.eslintrc.json` | 新規 | `@typescript-eslint` recommended 構成 | T003 |
| `backend/jest.config.js` | 新規 | `ts-jest` 構成。`coverageThreshold` 80% | T005 |
| `backend/src/index.ts` | 変更 | ルータのマウントと共通エラーハンドリングを追加（`/health` は維持） | T012, T020, T049 |
| `backend/src/types/index.ts` | 新規 | `Book` / `OrderRequest` / `OrderItemSnapshot` / `ApiError` 型とエラーファクトリ | T011 |
| `backend/src/db/pool.ts` | 新規 | `mysql2/promise` のコネクションプール生成 | T010 |
| `backend/src/routes/books.ts` | 新規 | `GET /api/books` / `GET /api/books/:id` | T018, T019 |
| `backend/src/routes/orders.ts` | 新規 | `POST /api/orders` | T048 |
| `backend/src/services/orderService.ts` | 新規 | 注文作成のトランザクション制御とスナップショット化 | T046, T047 |
| `backend/src/domain/calcOrderTotal.ts` | 新規 | 小計・合計の算出（純関数） | T044 |
| `backend/src/domain/validateOrderRequest.ts` | 新規 | 注文リクエストの検証（純関数） | T042 |
| `backend/src/domain/generateOrderNumber.ts` | 新規 | 注文番号の生成（純関数） | T040 |
| `backend/tests/unit/*.test.ts` | 新規 | ドメイン3モジュールの単体テスト | T041, T043, T045 |
| `backend/tests/integration/*.test.ts` | 新規 | supertest による API 結合テスト | T021, T050 |

### 1.2 フロントエンド

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `frontend/package.json` | 変更 | ESLint・Jest の開発依存と `lint` / `test` スクリプトを追加 | T004, T006 |
| `frontend/.eslintrc.json` | 新規 | `next/core-web-vitals` 構成 | T004 |
| `frontend/jest.config.js` | 新規 | `next/jest` 構成。`coverageThreshold` 80% | T006 |
| `frontend/src/app/globals.css` | 新規 | 共有 CSS 変数（色・間隔・フォント） | T013 |
| `frontend/src/app/layout.tsx` | 変更 | `globals.css` 読み込み、`CartProvider` と `Header` を組み込み | T017, T030 |
| `frontend/src/app/page.tsx` | 変更 | 雛形の起動確認画面を商品一覧（SCR-001）に置き換え | T023 |
| `frontend/src/app/books/[id]/page.tsx` | 新規 | 商品詳細（SCR-002） | T024, T031 |
| `frontend/src/app/cart/page.tsx` | 新規 | カート（SCR-003） | T036, T037, T038 |
| `frontend/src/app/checkout/page.tsx` | 新規 | 注文フォーム（SCR-004） | T053〜T057, T060 |
| `frontend/src/app/order-complete/page.tsx` | 新規 | 注文完了（SCR-005） | T058, T059 |
| `frontend/src/components/Header.tsx` | 新規 | 共通ヘッダー・カート件数 | T029 |
| `frontend/src/components/BookCard.tsx` | 新規 | 一覧のカード（詳細へのリンクを含む） | T022 |
| `frontend/src/components/CartSummary.tsx` | 新規 | 注文内容と合計（操作あり／なしを切替） | T035 |
| `frontend/src/components/ErrorNotice.tsx` | 新規 | 共通エラー表示 | T014 |
| `frontend/src/components/EmptyState.tsx` | 新規 | 共通空状態表示 | T015 |
| `frontend/src/lib/cartContext.tsx` | 新規 | カート状態＋`localStorage` 永続化 | T026, T027 |
| `frontend/src/lib/calcCartTotal.ts` | 新規 | 小計・合計の算出（純関数） | T033 |
| `frontend/src/lib/validateOrderForm.ts` | 新規 | フォーム検証（純関数） | T051 |
| `frontend/src/lib/apiClient.ts` | 新規 | API 呼び出しとエラー応答のパース | T016 |
| `frontend/tests/*.test.tsx` | 新規 | 単体テスト | T025, T028, T032, T034, T039, T052, T061 |

### 1.3 データベース・設定

| ファイルパス | 種別 | 変更内容概要 | 関連タスクID |
|---|---|---|---|
| `mysql/init/01_init.sql` | 変更 | 雛形のサンプル `users` テーブルを本仕様の3テーブルに置き換え | T008 |
| `mysql/init/02_seed.sql` | 新規 | 書籍の初期データ（販売停止・書影なしを各1冊以上含む） | T009 |
| `docker-compose.yml` | 変更なし | 雛形のまま使用 | T001 |
| `.env` | 新規 | `.env.example` からコピー。**コミットしない** | T002 |

> **前提**: 上記のうち「変更」と記した雛形ファイルは、T001（`git checkout origin/main -- ...`）で本ブランチへ取り込んだ後に編集する。
> 本ブランチには雛形が存在しないため、T001 未実行の状態では本設計書の内容を実装できない。

---
## 2. モジュール詳細

> **シーケンス図の方針**: 複数モジュール間のやり取りが発生する3つの流れ（書籍一覧取得・カート追加と永続化・注文確定）についてシーケンス図を示す。
> `domain/` 配下および `lib/` 配下の**純関数は他モジュールと対話しない**ため、シーケンス図を作らずパラメータ定義で仕様を確定させる。

---

### 2.1 `backend/src/db/pool.ts`

#### 処理概要

`mysql2/promise` のコネクションプールを1つ生成し、アプリ全体で共有する。接続情報は環境変数からのみ取得し、ソースコードへ直書きしない（`tech-stack.md` §8）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `pool` | 定数（`mysql.Pool`） | プールのシングルトン。各ルータ・サービスから import して使う |
| `getConnection` | 関数 | トランザクション用に接続を1本取り出す（`orderService` が使用） |

#### パラメータ定義

**入力（Input）** — 環境変数のみ

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `DB_HOST` | string | ○ | MySQL ホスト名（compose では `mysql`） | 未設定時は起動時エラー |
| `DB_PORT` | number | ○ | ポート（既定 3306） | 数値変換できること |
| `DB_NAME` | string | ○ | データベース名 | 未設定時は起動時エラー |
| `DB_USER` | string | ○ | ユーザー名 | 未設定時は起動時エラー |
| `DB_PASSWORD` | string | ○ | パスワード | 未設定時は起動時エラー |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `pool` | `mysql.Pool` | 共有コネクションプール | `connectionLimit` は既定値を使用 |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 必須の環境変数が未設定 | — | 起動時に例外を投げてプロセスを停止する（設定漏れを黙って動かさない） |
| 接続失敗・クエリ失敗 | `INTERNAL_ERROR` | 呼び出し元へ例外を伝播し、共通エラーハンドラが 500 を返す。**本文に接続情報・SQL を含めない** |

---

### 2.2 `backend/src/domain/generateOrderNumber.ts`

#### 処理概要

ULID 形式（Crockford Base32・26文字）の注文番号を生成する純関数。先頭48ビットがミリ秒精度のタイムスタンプ、残り80ビットが乱数。`ulid` パッケージを追加せず `crypto.randomBytes` で実装する（research.md D-03）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `generateOrderNumber` | 関数 | 注文番号を1件生成して返す |
| `encodeBase32` | 関数（内部） | バイト列を Crockford Base32 へ変換する |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `now` | number | — | 生成時刻（ミリ秒）。省略時は `Date.now()`。**テストで時刻を固定するための引数** | 0以上の整数 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| （戻り値） | string | 26文字の注文番号 | 文字種は `0123456789ABCDEFGHJKMNPQRSTVWXYZ`（I・L・O・U を除外） |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 乱数生成に失敗 | `INTERNAL_ERROR` | 例外を伝播。注文は確定させない |
| 生成値が既存と重複 | `INTERNAL_ERROR` | `orders.order_number` の UNIQUE 制約で INSERT が失敗し、トランザクションが ROLLBACK される（FR-026 に合流） |

---

### 2.3 `backend/src/domain/validateOrderRequest.ts`

#### 処理概要

注文リクエストの顧客情報と明細を検証する純関数。フロントの `validateOrderForm.ts` と**同一の規則**を実装し、バックエンドを最終防衛線とする（contracts/orders-api.md）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `validateOrderRequest` | 関数 | 検証結果（`valid` と `fields`）を返す |
| `isValidEmail` | 関数（内部） | メールアドレスの形式判定 |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `customer.name` | string | ○ | 氏名 | trim 後1文字以上100文字以内。未満は `REQUIRED`、超過は `TOO_LONG` |
| `customer.address` | string | ○ | 住所 | trim 後1文字以上255文字以内 |
| `customer.email` | string | ○ | メールアドレス | trim 後1文字以上255文字以内。ローカル部・`@`・ドメイン部（ドットを含む）の構造。不正は `INVALID_FORMAT` |
| `items` | array | ○ | 注文明細 | 1件以上。0件は `EMPTY` |
| `items[].bookId` | number | ○ | 書籍 ID | 正の整数。配列内で重複不可（`DUPLICATE_BOOK`） |
| `items[].quantity` | number | ○ | 数量 | 1以上の整数。違反は `INVALID_QUANTITY`。**上限は設けない**（FR-011b） |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `valid` | boolean | 全項目が妥当なとき `true` | |
| `fields` | `Record<string, string>` | 項目名 → エラー種別 | contracts/orders-api.md の `details.fields` にそのまま載る |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| いずれかの項目が不正 | `VALIDATION_ERROR` | ルータが 400 と `details.fields` を返す。**注文は確定させない**（FR-020） |
| リクエストが JSON として不正 | `VALIDATION_ERROR` | `express.json()` の失敗を共通エラーハンドラが 400 に変換 |

> **設計上の注意**: 金額（`price` / `totalAmount`）はリクエストに含めない。含まれていても無視する（改ざん防止・FR-024）。

---

### 2.4 `backend/src/domain/calcOrderTotal.ts`

#### 処理概要

`books` から取得した単価と数量から、明細ごとの小計と注文全体の合計を算出する純関数。整数の円のみを扱い、送料・手数料・割引を含めない（FR-013 / research.md D-10）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `calcOrderTotal` | 関数 | 明細のスナップショットと合計金額を返す |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `books` | `Book[]` | ○ | DB から取得した書籍（`id` / `title` / `price`） | 呼び出し元で販売中のもののみに絞る |
| `items` | `{ bookId, quantity }[]` | ○ | 注文明細 | `validateOrderRequest` 通過後の値 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `items[].title` | string | 注文時点の書名 | `order_items.title` に保存 |
| `items[].unitPrice` | number | 注文時点の単価（整数円） | `order_items.unit_price` に保存 |
| `items[].quantity` | number | 数量 | |
| `items[].subtotal` | number | `unitPrice × quantity` | `order_items.subtotal` に保存 |
| `totalAmount` | number | 小計の総和 | `orders.total_amount` に保存 |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `items` に対応する書籍が `books` に存在しない | — | 例外を投げる。呼び出し元（`orderService`）が事前に突合しているため、ここに到達するのは実装不整合 |

---

### 2.5 `backend/src/services/orderService.ts`

#### 処理概要

注文作成の中核。対象書籍の実在・販売状態を確認し、サーバ側で金額を算出し、注文番号を発行して `orders` と `order_items` を**単一トランザクション**で登録する。途中失敗時は ROLLBACK し、部分的な注文を残さない（FR-024〜FR-026 / research.md D-08）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `createOrder` | 関数 | 注文作成の全体制御。`BooksUnavailableError` または確定結果を返す |
| `BooksUnavailableError` | クラス | 販売停止・削除された書籍が含まれる場合の例外。`unavailableBookIds` を持つ |

#### シーケンス図（UML: シーケンス図）— 注文確定の流れ

<!-- plantuml:
@startuml
actor 利用者
participant "注文フォーム\n/checkout" as FORM
participant "apiClient" as API
participant "POST /api/orders\n(routes/orders.ts)" as ROUTE
participant "orderService" as SVC
database "MySQL" as DB
利用者 -> FORM : 「注文する」押下
FORM -> FORM : validateOrderForm()
alt 入力不正
  FORM --> 利用者 : 項目別エラー表示（遷移しない）
end
FORM -> FORM : 送信ボタンを disabled
FORM -> API : createOrder(customer, items)
API -> ROUTE : POST /api/orders
ROUTE -> ROUTE : validateOrderRequest()
alt 検証 NG
  ROUTE --> API : 400 VALIDATION_ERROR
end
ROUTE -> SVC : createOrder()
SVC -> DB : SELECT ... WHERE id IN (?) AND is_available = TRUE
DB --> SVC : 書籍（販売中のみ）
alt 不足あり
  SVC --> ROUTE : BooksUnavailableError
  ROUTE --> API : 409 BOOKS_UNAVAILABLE
end
SVC -> SVC : calcOrderTotal() / generateOrderNumber()
SVC -> DB : BEGIN → INSERT orders → INSERT order_items → COMMIT
DB --> SVC : OK
SVC --> ROUTE : { orderNumber, totalAmount, items }
ROUTE --> API : 201 Created
API --> FORM : order
FORM -> FORM : カートを空にする / sessionStorage へ保存 / 遷移
@enduml
-->

<svg viewBox="0 0 960 700" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="注文確定のシーケンス図">
  <defs>
    <marker id="sq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#37474f"/>
    </marker>
    <marker id="sqr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6a1b9a"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="960" height="700" fill="#ffffff"/>

  <rect x="20" y="20" width="110" height="46" rx="5" fill="#eceff1" stroke="#455a64" stroke-width="1.6"/>
  <text x="75" y="48" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">利用者</text>
  <rect x="160" y="20" width="130" height="46" rx="5" fill="#fff8e1" stroke="#c49000" stroke-width="1.6"/>
  <text x="225" y="41" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6d4c00">注文フォーム</text>
  <text x="225" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#8a6100">/checkout</text>
  <rect x="330" y="20" width="110" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="385" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">apiClient</text>
  <rect x="475" y="20" width="140" height="46" rx="5" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1.6"/>
  <text x="545" y="41" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b5e20">POST /api/orders</text>
  <text x="545" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#2e7d32">routes/orders.ts</text>
  <rect x="655" y="20" width="125" height="46" rx="5" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1.6"/>
  <text x="717" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b5e20">orderService</text>
  <rect x="820" y="20" width="118" height="46" rx="5" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="1.6"/>
  <text x="879" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#4a148c">MySQL</text>

  <line x1="75" y1="66" x2="75" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="225" y1="66" x2="225" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="385" y1="66" x2="385" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="545" y1="66" x2="545" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="717" y1="66" x2="717" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="879" y1="66" x2="879" y2="680" stroke="#90a4ae" stroke-dasharray="5 4"/>

  <line x1="75" y1="100" x2="219" y2="100" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq)"/>
  <text x="147" y="93" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">「注文する」押下</text>

  <path d="M 225 122 L 275 122 L 275 142 L 231 142" fill="none" stroke="#37474f" stroke-width="1.6" marker-end="url(#sq)"/>
  <text x="285" y="136" font-family="sans-serif" font-size="11" fill="#37474f">validateOrderForm()</text>
  <path d="M 219 164 L 81 164" fill="none" stroke="#b71c1c" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="147" y="157" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#b71c1c">[不正] 項目別エラー・遷移しない</text>

  <path d="M 225 190 L 275 190 L 275 210 L 231 210" fill="none" stroke="#37474f" stroke-width="1.6" marker-end="url(#sq)"/>
  <text x="285" y="204" font-family="sans-serif" font-size="11" fill="#37474f">送信ボタンを disabled（二重送信防止）</text>

  <line x1="225" y1="240" x2="379" y2="240" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq)"/>
  <text x="302" y="233" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">createOrder()</text>
  <line x1="385" y1="272" x2="539" y2="272" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq)"/>
  <text x="462" y="265" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">POST /api/orders</text>

  <path d="M 545 294 L 595 294 L 595 314 L 551 314" fill="none" stroke="#37474f" stroke-width="1.6" marker-end="url(#sq)"/>
  <text x="605" y="308" font-family="sans-serif" font-size="11" fill="#37474f">validateOrderRequest()</text>
  <path d="M 539 336 L 391 336" fill="none" stroke="#b71c1c" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="465" y="329" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#b71c1c">[NG] 400 VALIDATION_ERROR</text>

  <line x1="545" y1="366" x2="711" y2="366" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq)"/>
  <text x="628" y="359" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">createOrder()</text>

  <line x1="717" y1="396" x2="873" y2="396" stroke="#6a1b9a" stroke-width="1.8" marker-end="url(#sqr)"/>
  <text x="795" y="389" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">SELECT ... WHERE id IN (?)</text>
  <text x="795" y="410" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">AND is_available = TRUE</text>
  <path d="M 873 432 L 723 432" fill="none" stroke="#6a1b9a" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sqr)"/>
  <text x="798" y="425" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">販売中の書籍</text>

  <path d="M 711 458 L 551 458" fill="none" stroke="#b71c1c" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="631" y="451" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#b71c1c">[不足あり] 409 BOOKS_UNAVAILABLE</text>

  <path d="M 717 480 L 767 480 L 767 500 L 723 500" fill="none" stroke="#37474f" stroke-width="1.6" marker-end="url(#sq)"/>
  <text x="640" y="516" font-family="sans-serif" font-size="10.5" fill="#37474f">calcOrderTotal() / generateOrderNumber()</text>

  <line x1="717" y1="546" x2="873" y2="546" stroke="#6a1b9a" stroke-width="2.2" marker-end="url(#sqr)"/>
  <text x="795" y="539" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#4a148c">BEGIN → INSERT orders</text>
  <text x="795" y="560" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#4a148c">→ INSERT order_items → COMMIT</text>
  <path d="M 873 582 L 723 582" fill="none" stroke="#6a1b9a" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sqr)"/>
  <text x="798" y="575" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">OK（失敗時は ROLLBACK）</text>

  <path d="M 711 608 L 551 608" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="631" y="601" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">{ orderNumber, totalAmount, items }</text>
  <path d="M 539 634 L 391 634" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="465" y="627" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">201 Created</text>
  <path d="M 379 660 L 231 660" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq)"/>
  <text x="305" y="653" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">order</text>
  <text x="120" y="682" font-family="sans-serif" font-size="10.5" fill="#6d4c00">→ カートを空にする／sessionStorage へ保存／/order-complete へ遷移</text>
</svg>

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `customer` | `{ name, address, email }` | ○ | 顧客情報 | `validateOrderRequest` 通過済み |
| `items` | `{ bookId, quantity }[]` | ○ | 注文明細 | 同上 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `orderNumber` | string | 発行した注文番号 | 26文字 |
| `totalAmount` | number | 確定した合計金額 | サーバ算出値 |
| `items` | `OrderItemSnapshot[]` | 注文時点のスナップショット | `title` / `unitPrice` / `quantity` / `subtotal` |

**`orders.id`（内部 ID）は返さない**（FR-029b / data-model.md §3.2）。

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 明細の書籍が存在しない、または販売停止 | `BOOKS_UNAVAILABLE` | 409。`details.unavailableBookIds` に該当 ID を列挙。**注文全体を確定しない** |
| INSERT 中の失敗（制約違反・接続断等） | `INTERNAL_ERROR` | ROLLBACK して 500。部分的な注文を残さない |
| 注文番号の UNIQUE 制約違反 | `INTERNAL_ERROR` | 同上。ROLLBACK され注文は成立しない |

---

### 2.6 `backend/src/routes/books.ts`

#### 処理概要

書籍参照の2エンドポイントを提供する。いずれも `is_available = TRUE` で絞り、販売停止の書籍を外部に出さない（FR-001a / FR-005a）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `booksRouter` | Express Router | ルータ本体 |
| `listBooks` | ハンドラ | `GET /api/books` |
| `getBook` | ハンドラ | `GET /api/books/:id` |

#### シーケンス図（UML: シーケンス図）— 書籍一覧の取得

<!-- plantuml:
@startuml
actor 利用者
participant "商品一覧\n(page.tsx)" as PAGE
participant "apiClient" as API
participant "GET /api/books\n(routes/books.ts)" as ROUTE
database "MySQL" as DB
利用者 -> PAGE : 商品一覧を開く
PAGE -> API : fetchBooks()
API -> ROUTE : GET /api/books
ROUTE -> DB : SELECT ... WHERE is_available = TRUE ORDER BY id ASC
DB --> ROUTE : 書籍（0件以上）
ROUTE --> API : 200 { books: [...] }
API --> PAGE : Book[]
alt 0件
  PAGE --> 利用者 : EmptyState（エラーにしない）
else 取得失敗
  PAGE --> 利用者 : ErrorNotice（再試行の導線）
else 正常
  PAGE --> 利用者 : BookCard のグリッド
end
@enduml
-->

<svg viewBox="0 0 900 430" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="書籍一覧取得のシーケンス図">
  <defs>
    <marker id="sq2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#37474f"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="900" height="430" fill="#ffffff"/>

  <rect x="20" y="20" width="110" height="46" rx="5" fill="#eceff1" stroke="#455a64" stroke-width="1.6"/>
  <text x="75" y="48" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">利用者</text>
  <rect x="190" y="20" width="130" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="255" y="41" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">商品一覧</text>
  <text x="255" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1565c0">app/page.tsx</text>
  <rect x="390" y="20" width="110" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="445" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">apiClient</text>
  <rect x="560" y="20" width="140" height="46" rx="5" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1.6"/>
  <text x="630" y="41" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b5e20">GET /api/books</text>
  <text x="630" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#2e7d32">routes/books.ts</text>
  <rect x="760" y="20" width="118" height="46" rx="5" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="1.6"/>
  <text x="819" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#4a148c">MySQL</text>

  <line x1="75" y1="66" x2="75" y2="410" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="255" y1="66" x2="255" y2="410" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="445" y1="66" x2="445" y2="410" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="630" y1="66" x2="630" y2="410" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="819" y1="66" x2="819" y2="410" stroke="#90a4ae" stroke-dasharray="5 4"/>

  <line x1="75" y1="100" x2="249" y2="100" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq2)"/>
  <text x="162" y="93" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">商品一覧を開く</text>
  <line x1="255" y1="132" x2="439" y2="132" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq2)"/>
  <text x="347" y="125" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">fetchBooks()</text>
  <line x1="445" y1="164" x2="624" y2="164" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq2)"/>
  <text x="534" y="157" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">GET /api/books</text>
  <line x1="630" y1="200" x2="813" y2="200" stroke="#6a1b9a" stroke-width="1.8" marker-end="url(#sq2)"/>
  <text x="721" y="188" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">SELECT ... WHERE is_available = TRUE</text>
  <text x="721" y="214" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">ORDER BY id ASC</text>
  <path d="M 813 240 L 636 240" fill="none" stroke="#6a1b9a" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq2)"/>
  <text x="724" y="233" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#4a148c">0件以上</text>
  <path d="M 624 272 L 451 272" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq2)"/>
  <text x="537" y="265" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">200 { books: [...] }</text>
  <path d="M 439 300 L 261 300" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq2)"/>
  <text x="350" y="293" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">Book[]</text>

  <rect x="140" y="318" width="240" height="84" rx="5" fill="#fafafa" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <text x="150" y="338" font-family="sans-serif" font-size="10.5" fill="#37474f">[0件] EmptyState（エラーにしない）</text>
  <text x="150" y="358" font-family="sans-serif" font-size="10.5" fill="#b71c1c">[取得失敗] ErrorNotice（再試行の導線）</text>
  <text x="150" y="378" font-family="sans-serif" font-size="10.5" fill="#1b5e20">[正常] BookCard のグリッド表示</text>
  <text x="150" y="396" font-family="sans-serif" font-size="10" fill="#78909c">ページ送り・追加読み込みなし（FR-001c）</text>
  <path d="M 140 360 L 81 360" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq2)"/>
</svg>

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| （`GET /api/books`） | — | — | パラメータなし。ページング・検索・並べ替えを受け付けない | FR-001c / FR-031 |
| `id`（`GET /api/books/:id`） | string（path） | ○ | 書籍 ID | 正の整数に変換できること。不可なら 404 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `books[]` | array | `id` / `title` / `author` / `price` / `coverImageUrl` | **`description` を含めない**（一覧では未使用） |
| `book` | object | 上記＋ `description` | 詳細のみ |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 該当0件（一覧） | — | **200 と空配列**。404 にしない（FR-004） |
| 不存在・販売停止・`id` 不正（詳細） | `BOOK_NOT_FOUND` | 404。**3条件を同じコードで返す**（存在の有無を外部に漏らさない・FR-005a） |
| DB 接続・クエリ失敗 | `INTERNAL_ERROR` | 500。本文に SQL・接続情報を含めない |

---

### 2.7 `backend/src/routes/orders.ts` / `backend/src/index.ts` / `backend/src/types/index.ts`

#### 処理概要

`orders.ts` は `POST /api/orders` の HTTP 境界を担い、検証 → `orderService` 呼び出し → ステータス変換を行う。`index.ts` は Express の起動・CORS・ルータのマウント・共通エラーハンドラの登録を担う。`types/index.ts` は共有型とエラー応答のファクトリを提供する（research.md D-11）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `ordersRouter` | Express Router | `POST /api/orders` |
| `errorHandler` | ミドルウェア | 例外を `{ error: { code, message, details? } }` に整形（`index.ts` に登録） |
| `apiError` | 関数 | エラー応答オブジェクトを生成するファクトリ（`types/index.ts`） |
| `Book` / `OrderRequest` / `OrderItemSnapshot` / `ApiError` | 型 | 共有型定義。`any` を使わない |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 検証 NG | `VALIDATION_ERROR` | 400 ＋ `details.fields` |
| `BooksUnavailableError` | `BOOKS_UNAVAILABLE` | 409 ＋ `details.unavailableBookIds` |
| 未捕捉の例外 | `INTERNAL_ERROR` | 500。スタックトレース・SQL・接続情報を本文に含めない |

---
### 2.8 `frontend/src/lib/cartContext.tsx`

#### 処理概要

カート状態を React Context で保持し、変更のたびに `localStorage`（キー `cart`）へ同期する。初回マウント時に復元する。保持するのは `{ bookId, quantity }` のみで、書名・価格は保存しない（表示のたびに API の最新値を使う・research.md D-01）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `CartProvider` | コンポーネント | Context の供給。`layout.tsx` に配置し5画面へ行き渡らせる |
| `useCart` | フック | カート状態と操作関数を取得する |
| `addItem` | 関数 | 書籍を追加。既存行があれば数量を1加算（FR-009） |
| `setQuantity` | 関数 | 数量を設定。**0以下になった行は自動削除**（FR-011a） |
| `removeItem` | 関数 | 行を明示的に削除（FR-012） |
| `clearCart` | 関数 | カートを空にし `localStorage` からも削除（FR-022a） |
| `totalQuantity` | 導出値 | **数量の合計**。ヘッダーの件数に使う（FR-033） |

#### シーケンス図（UML: シーケンス図）— カート追加と永続化

<!-- plantuml:
@startuml
actor 利用者
participant "商品詳細\n/books/[id]" as PAGE
participant "cartContext" as CTX
database "localStorage" as LS
participant "Header" as HDR
利用者 -> PAGE : 「カートに追加」押下
PAGE -> CTX : addItem(bookId)
alt 既存行あり
  CTX -> CTX : quantity += 1（行は増やさない）
else 新規
  CTX -> CTX : { bookId, quantity: 1 } を追加
end
CTX -> LS : setItem("cart", JSON)
alt 書き込み失敗
  CTX -> CTX : メモリ上のカートとして継続（画面は壊さない）
end
CTX -> HDR : totalQuantity 更新通知
HDR --> 利用者 : 件数が増える（画面遷移なし）
== 再訪時 ==
利用者 -> PAGE : サイトを再訪
CTX -> LS : getItem("cart")
LS --> CTX : 保存済みカート
CTX --> HDR : 復元した件数を表示
@enduml
-->

<svg viewBox="0 0 900 520" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="カート追加と永続化のシーケンス図">
  <defs>
    <marker id="sq3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#37474f"/>
    </marker>
    <marker id="sq3y" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#c49000"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="900" height="520" fill="#ffffff"/>

  <rect x="20" y="20" width="110" height="46" rx="5" fill="#eceff1" stroke="#455a64" stroke-width="1.6"/>
  <text x="75" y="48" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">利用者</text>
  <rect x="190" y="20" width="130" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="255" y="41" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">商品詳細</text>
  <text x="255" y="57" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#1565c0">/books/[id]</text>
  <rect x="390" y="20" width="120" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="450" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">cartContext</text>
  <rect x="580" y="20" width="120" height="46" rx="5" fill="#fff8e1" stroke="#c49000" stroke-width="1.6"/>
  <text x="640" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#6d4c00">localStorage</text>
  <rect x="770" y="20" width="108" height="46" rx="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>
  <text x="824" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0d3c61">Header</text>

  <line x1="75" y1="66" x2="75" y2="500" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="255" y1="66" x2="255" y2="500" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="450" y1="66" x2="450" y2="500" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="640" y1="66" x2="640" y2="500" stroke="#90a4ae" stroke-dasharray="5 4"/>
  <line x1="824" y1="66" x2="824" y2="500" stroke="#90a4ae" stroke-dasharray="5 4"/>

  <line x1="75" y1="100" x2="249" y2="100" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq3)"/>
  <text x="162" y="93" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">「カートに追加」押下</text>
  <line x1="255" y1="132" x2="444" y2="132" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq3)"/>
  <text x="350" y="125" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">addItem(bookId)</text>

  <path d="M 450 154 L 500 154 L 500 174 L 456 174" fill="none" stroke="#37474f" stroke-width="1.6" marker-end="url(#sq3)"/>
  <text x="510" y="162" font-family="sans-serif" font-size="10.5" fill="#1b5e20">[既存行あり] quantity += 1（行を増やさない）</text>
  <text x="510" y="180" font-family="sans-serif" font-size="10.5" fill="#37474f">[新規] { bookId, quantity: 1 } を追加</text>

  <line x1="450" y1="212" x2="634" y2="212" stroke="#c49000" stroke-width="1.8" marker-end="url(#sq3y)"/>
  <text x="542" y="205" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#6d4c00">setItem("cart", JSON)</text>
  <path d="M 450 234 L 500 234 L 500 254 L 456 254" fill="none" stroke="#b71c1c" stroke-width="1.6" marker-end="url(#sq3)"/>
  <text x="510" y="248" font-family="sans-serif" font-size="10.5" fill="#b71c1c">[書込失敗] メモリ上のカートとして継続（画面を壊さない）</text>

  <line x1="450" y1="286" x2="818" y2="286" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq3)"/>
  <text x="634" y="279" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">totalQuantity（数量の合計）を更新</text>
  <path d="M 818 314 L 81 314" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq3)"/>
  <text x="450" y="307" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">ヘッダーの件数が増える（画面遷移なし）</text>

  <line x1="20" y1="344" x2="880" y2="344" stroke="#90a4ae" stroke-width="1.2"/>
  <rect x="380" y="332" width="140" height="24" rx="4" fill="#eceff1" stroke="#90a4ae"/>
  <text x="450" y="349" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#37474f">再訪時（FR-016）</text>

  <line x1="75" y1="384" x2="249" y2="384" stroke="#37474f" stroke-width="1.8" marker-end="url(#sq3)"/>
  <text x="162" y="377" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">サイトを再訪</text>
  <line x1="450" y1="416" x2="634" y2="416" stroke="#c49000" stroke-width="1.8" marker-end="url(#sq3y)"/>
  <text x="542" y="409" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#6d4c00">getItem("cart")</text>
  <path d="M 634 444 L 456 444" fill="none" stroke="#c49000" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq3y)"/>
  <text x="545" y="437" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#6d4c00">保存済みカート</text>
  <path d="M 456 472 L 818 472" fill="none" stroke="#37474f" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#sq3)"/>
  <text x="637" y="465" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#37474f">復元した件数を表示（端末・ブラウザを跨がない）</text>
</svg>

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `bookId`（`addItem`） | number | ○ | 追加する書籍 ID | 正の整数 |
| `bookId`, `quantity`（`setQuantity`） | number | ○ | 対象と新しい数量 | **0以下は行の削除として扱う**。上限なし |
| `bookId`（`removeItem`） | number | ○ | 削除する書籍 ID | 正の整数 |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `items` | `{ bookId, quantity }[]` | カートの内容 | 同一 `bookId` は常に1要素 |
| `totalQuantity` | number | 数量の合計 | ヘッダーの件数（FR-033） |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| `localStorage` の読み書きが例外を投げる | — | try/catch で捕捉し、**メモリ上のカートとして動作を継続**する。画面をエラーにしない（憲法§3） |
| 保存値が JSON として壊れている | — | 空のカートとして扱い、壊れた値を上書きする |

---

### 2.9 `frontend/src/lib/calcCartTotal.ts` / `validateOrderForm.ts` / `apiClient.ts`

#### 処理概要

`calcCartTotal` は小計・合計を算出する純関数（`backend/src/domain/calcOrderTotal.ts` と同じ算出規則）。`validateOrderForm` は `backend/src/domain/validateOrderRequest.ts` と**同一の検証規則**を実装する。`apiClient` は `NEXT_PUBLIC_API_URL` を基点に API を呼び、エラー応答を共通形式へパースする。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `calcCartTotal` | 関数 | カートと書籍情報から小計・合計を算出 |
| `validateOrderForm` | 関数 | 氏名・住所・メールを検証し項目別エラーを返す |
| `fetchBooks` / `fetchBook` / `createOrder` | 関数 | 各エンドポイントの呼び出し |
| `ApiClientError` | クラス | HTTP ステータスと `error.code` / `details` を保持する例外 |

#### パラメータ定義（`calcCartTotal`）

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `items` | `{ bookId, quantity }[]` | ○ | カートの内容 | — |
| `books` | `Book[]` | ○ | 表示用に取得した書籍（最新の価格） | カートにあって `books` にない書籍は合計から除外し、呼び出し元が「購入できない書籍」として提示する（FR-016b） |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| `lines[].subtotal` | number | `price × quantity` | 整数円 |
| `total` | number | 小計の総和 | 送料・手数料・割引を含めない |
| `unavailableBookIds` | number[] | `books` に見つからなかった書籍 ID | カート画面での提示に使う |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| API が 4xx / 5xx を返した | 応答の `error.code` | `ApiClientError` を投げる。画面側が `ErrorNotice` で表示する |
| ネットワーク断・JSON パース失敗 | `INTERNAL_ERROR` 相当 | 同上。画面は白画面にせず再試行の導線を示す |

---

### 2.10 `frontend/src/app/checkout/page.tsx`

#### 処理概要

顧客情報の入力欄と `CartSummary`（操作なし）を同一画面に配置し、検証 → 送信 → 成功時のカートクリアと画面遷移までを担う（FR-017〜FR-022b）。カートが0件の場合はフォームを表示しない。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `CheckoutPage` | コンポーネント | 画面本体 |
| `handleSubmit` | 関数 | 検証 → `createOrder` 呼び出し → 結果に応じた分岐 |

> シーケンス図は [2.5 `orderService`](#25-backendsrcservicesorderservicets) の「注文確定の流れ」に統合して示している。

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `name` | string | ○ | 氏名 | `validateOrderForm` に準拠 |
| `address` | string | ○ | 住所 | 同上 |
| `email` | string | ○ | メールアドレス | 同上 |
| （カート） | Context | ○ | 注文対象と合計 | **0件のときはフォームを表示しない**（FR-014） |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| （画面遷移） | — | 成功時に `/order-complete` へ遷移 | 注文番号を URL に含めない（FR-029b） |
| `sessionStorage` | — | 注文結果を一時保存 | 注文完了画面が読み出して即削除 |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 入力が不正 | — | 項目別にエラー表示。送信しない。**入力内容を保持**（FR-020） |
| 400 `VALIDATION_ERROR` | `VALIDATION_ERROR` | `details.fields` を項目別エラーへ反映 |
| 409 `BOOKS_UNAVAILABLE` | `BOOKS_UNAVAILABLE` | 該当書籍を特定できる形で提示。**遷移しない**（FR-016b） |
| 500 `INTERNAL_ERROR` | `INTERNAL_ERROR` | `ErrorNotice` を表示。**カートと入力内容を保持**（FR-022b, FR-026） |
| 送信中の再押下 | — | ボタンが `disabled` のため発生しない（FR-025） |

---

### 2.11 `frontend/src/app/order-complete/page.tsx`

#### 処理概要

マウント時に `sessionStorage` から注文結果を読み出し、**即座に削除する**（一度きりの読み出し）。読み出せた場合のみ完了メッセージ・注文番号・一覧へ戻るリンクを表示する（FR-027〜FR-029c / research.md D-02）。

#### クラス / 関数 一覧

| 名称 | 種別 | 役割 |
|---|---|---|
| `OrderCompletePage` | コンポーネント | 画面本体 |
| `consumeOrderResult` | 関数 | `sessionStorage` からの読み出しと削除を1回で行う |

#### パラメータ定義

**入力（Input）**

| パラメータ名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| `sessionStorage["lastOrder"]` | string(JSON) | — | 直前の注文結果 | JSON として解釈できること。**読み出し後は必ず削除** |

**出力（Output）**

| パラメータ名 | 型 | 説明 | 備考 |
|---|---|---|---|
| （表示） | — | 完了メッセージ・注文番号・一覧へ戻るリンク | 注文番号は再表示できない旨を併記（FR-029c） |

#### エラー処理

| エラー条件 | エラーコード | レスポンス / 処理 |
|---|---|---|
| 読み出せない（再読込・直接アクセス・ブックマークからの再訪） | — | **注文情報を一切表示せず**、商品一覧への導線のみを示す（FR-029a）。エラー画面にはしない |
| JSON が壊れている | — | 同上（読み出せなかった場合と同じ扱い） |

---

### 2.12 共通コンポーネント

| ファイル | 処理概要 | 主な Input | 主な Output |
|---|---|---|---|
| `components/Header.tsx` | 全画面共通ヘッダー。カート画面への導線と件数（数量合計）を常時表示（FR-032〜FR-035） | `useCart().totalQuantity` | ヘッダー DOM。0件でも件数が分かる表示 |
| `components/BookCard.tsx` | 一覧のカード。**カード全体を `/books/[id]` へのリンク**とし、キーボードで到達できるようにする（FR-002, FR-003） | `Book` | カード DOM。`coverImageUrl` が null のとき代替表示 |
| `components/CartSummary.tsx` | 書名・単価・数量・小計と合計を表示。**数量操作の表示有無を切り替え可能**（カート＝操作あり／注文フォーム＝表示のみ） | `lines`, `total`, `editable` | 一覧 DOM |
| `components/ErrorNotice.tsx` | API エラー応答を統一された見た目で表示（FR-030） | `ApiClientError` | エラー表示 DOM |
| `components/EmptyState.tsx` | 空状態のメッセージと導線（FR-004, FR-014） | `message`, `action` | 空状態 DOM |

---

## 3. API 詳細仕様

> [`contracts/`](./contracts/) と整合を取ること。差異が生じた場合は `contracts/` を正とする。

### 3.1 GET /api/books

| 項目 | 内容 |
|---|---|
| 説明 | 販売中の書籍を全件取得する（`id` 昇順・ページングなし） |
| 認証 | 不要 |

**リクエスト**: パラメータなし

**レスポンス（正常・200）**

```json
{
  "books": [
    { "id": 1, "title": "吾輩は猫である", "author": "夏目漱石", "price": 880, "coverImageUrl": "https://example.com/covers/1.jpg" },
    { "id": 2, "title": "銀河鉄道の夜", "author": "宮沢賢治", "price": 660, "coverImageUrl": null }
  ]
}
```

**レスポンス（エラー）**

| HTTPステータス | エラーコード | 説明 |
|---|---|---|
| 500 | `INTERNAL_ERROR` | DB 接続・クエリ失敗 |

> 該当0件でも **200 と空配列**を返す（404 にしない・FR-004）。

### 3.2 GET /api/books/:id

| 項目 | 内容 |
|---|---|
| 説明 | 書籍1冊の詳細を取得する |
| 認証 | 不要 |

**レスポンス（正常・200）**

```json
{
  "book": {
    "id": 1,
    "title": "吾輩は猫である",
    "author": "夏目漱石",
    "price": 880,
    "description": "中学校の英語教師である珍野苦沙弥の家に住み着いた猫の視点から……",
    "coverImageUrl": "https://example.com/covers/1.jpg"
  }
}
```

**レスポンス（エラー）**

| HTTPステータス | エラーコード | 説明 |
|---|---|---|
| 404 | `BOOK_NOT_FOUND` | 不存在・販売停止・`id` 不正（**3条件を区別せず同一コード**） |
| 500 | `INTERNAL_ERROR` | DB 接続・クエリ失敗 |

### 3.3 POST /api/orders

| 項目 | 内容 |
|---|---|
| 説明 | 注文を作成する。検証・書籍確認・金額算出・注文番号発行・スナップショット化を1回で行う |
| 認証 | 不要 |

**リクエスト**

```json
{
  "customer": {
    "name": "小林 景大",
    "address": "東京都千代田区丸の内1-1-1",
    "email": "kobayashi@example.com"
  },
  "items": [
    { "bookId": 1, "quantity": 2 },
    { "bookId": 5, "quantity": 1 }
  ]
}
```

> **金額を受け取らない。** 送信されても無視し、サーバが `books.price` から算出する（FR-024）。

**レスポンス（正常・201）**

```json
{
  "order": {
    "orderNumber": "01K59Z4M8QX3V7TPB2NHRG6WDC",
    "totalAmount": 2420,
    "items": [
      { "title": "吾輩は猫である", "unitPrice": 880, "quantity": 2, "subtotal": 1760 },
      { "title": "銀河鉄道の夜", "unitPrice": 660, "quantity": 1, "subtotal": 660 }
    ]
  }
}
```

> **`orders.id`（内部 ID）を返さない**（FR-029b）。

**レスポンス（エラー）**

| HTTPステータス | エラーコード | 説明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 顧客情報または明細が不正。`details.fields` に項目別のエラー種別（`REQUIRED` / `TOO_LONG` / `INVALID_FORMAT` / `EMPTY` / `INVALID_QUANTITY` / `DUPLICATE_BOOK`） |
| 409 | `BOOKS_UNAVAILABLE` | 販売停止・削除された書籍を含む。`details.unavailableBookIds` に該当 ID。注文全体を確定しない |
| 500 | `INTERNAL_ERROR` | トランザクション失敗・DB 接続失敗。ROLLBACK 済みで注文は成立していない |

---

## 4. DB 操作詳細

> テーブル定義は `/speckit.design table` の生成物（`table-definition.md`）を参照。ここでは SQL の設計方針のみ示す。
> **全クエリで `mysql2` のプレースホルダ（`?`）を使用し、リクエスト値を SQL 文字列へ連結しない**（`tech-stack.md` §8）。

| 操作 | 対象テーブル | SQL概要 | トランザクション |
|---|---|---|---|
| SELECT | `books` | `SELECT id, title, author, price, cover_image_url FROM books WHERE is_available = TRUE ORDER BY id ASC` | 不要 |
| SELECT | `books` | `SELECT id, title, author, price, description, cover_image_url FROM books WHERE id = ? AND is_available = TRUE` | 不要 |
| SELECT | `books` | `SELECT id, title, price FROM books WHERE id IN (?) AND is_available = TRUE`（注文確定時の突合・FR-016b） | トランザクション内 |
| INSERT | `orders` | `INSERT INTO orders (order_number, customer_name, customer_address, customer_email, total_amount) VALUES (?, ?, ?, ?, ?)` | **必要** |
| INSERT | `order_items` | `INSERT INTO order_items (order_id, book_id, title, unit_price, quantity, subtotal) VALUES ?`（複数行を一括） | **必要**（`orders` と同一トランザクション） |
| UPDATE | — | **本フィーチャーでは発生しない**。`books` は参照のみ、`orders` / `order_items` は確定後に更新しない（FR-024） | — |
| DELETE | — | **本フィーチャーでは発生しない** | — |
| DDL | — | **アプリケーションコードから発行しない**。スキーマは `mysql/init/` の初期化 SQL のみで定義する（憲法§1 / `tech-stack.md` §8） | — |

### 4.1 注文作成のトランザクション手順

```
1. conn = pool.getConnection()
2. conn.beginTransaction()
3. SELECT ... FROM books WHERE id IN (?) AND is_available = TRUE
   └─ 要求された bookId が揃わない → BooksUnavailableError → rollback → 409
4. calcOrderTotal() / generateOrderNumber()（DB アクセスなし）
5. INSERT INTO orders ...            → insertId を取得
6. INSERT INTO order_items ... (5 の insertId を order_id に使用)
7. conn.commit()
   └─ 3〜6 のいずれかで例外 → conn.rollback() → 500
8. conn.release()（成功・失敗いずれの場合も finally で実行）
```

**設計意図**: 手順3をトランザクション内で行うことで、突合と INSERT の間に書籍の販売状態が変わっても整合が保たれる。手順4に DB アクセスを含めないため、トランザクションの保持時間を短くできる。

---

## 5. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | <!-- 要確認: 未記入 --> | | — |
| アーキテクト / テックリード | <!-- 要確認: 未記入 --> | | |
| PM / プロジェクトリーダー | <!-- 要確認: 未記入 --> | | |

> **承認前の留意事項**
> 1. `/speckit.analyze` の CRITICAL 1件（憲法§5 — `tech-stack.md` の AI 代行編集が担当者未確定）が未解決である。
> 2. 本設計書の実装には **T001（`git checkout origin/main -- frontend backend docker-compose.yml mysql .env.example .gitignore`）の実行が必須**。本ブランチには雛形が存在しない。
> 3. 本書で「変更」としたファイルは、T001 実行後の雛形を前提としている。
