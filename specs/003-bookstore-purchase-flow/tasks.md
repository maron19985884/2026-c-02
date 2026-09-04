---
description: "Task list for 003-bookstore-purchase-flow"
---

# Tasks: 個人運営オンライン書店 購買フロー

**Input**: Design documents from `specs/003-bookstore-purchase-flow/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/](contracts/), [research.md](research.md), [quickstart.md](quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可（別ファイル・依存なし）
- **[Story]**: 対応ユーザーストーリー（US1 / US2 / US3）
- パスは [plan.md](plan.md) の Structure Decision に準拠（Web application: `backend/` + `frontend/` + `mysql/`）

## User Story と優先度

| Story | 内容 | 優先度 |
|---|---|---|
| US1 | 書籍を選んで注文を完了する（一覧→詳細→カート追加→フォーム入力→確定→完了） | P1 🎯 MVP |
| US2 | カートの中身を調整する（数量増減・削除・合計のリアルタイム更新・空状態） | P2 |
| US3 | 入力ミスに気づいて修正する（必須3項目・メール形式・項目別エラー表示） | P2 |

---

## Phase 1: Setup（共通基盤）

**Purpose**: プロジェクト初期化とツール設定

> ⛔ **前提ゲート**: T002〜T005 に着手する前に、[plan.md](plan.md) の「実装前ゲート」（`tech-stack.md` へのテストFW=Jest・test/lint devDependencies・CSS 方針の追記、`/speckit.review` での設計承認）を人間が完了させること。憲法 §5 により AI は `tech-stack.md` を編集しない。

- [ ] T001 リポジトリ構成を [plan.md](plan.md) の Project Structure に合わせて用意する（`backend/src/{config,routes,services,domain,repositories}`、`backend/tests/{unit,integration}`、`frontend/{app,components,lib,tests}`、`mysql/init/` のディレクトリ作成）
- [ ] T002 `backend/package.json` を整備する（依存: `express`,`cors`,`mysql2` / 開発依存: `typescript`,`ts-node-dev`,`@types/node`,`@types/express`,`@types/cors`,`jest`,`ts-jest`,`@types/jest`,`supertest`,`@types/supertest`,`eslint`,`@typescript-eslint/parser`,`@typescript-eslint/eslint-plugin`）。`scripts`: `dev`/`build`/`start`/`test`/`lint`
- [ ] T003 `frontend/package.json` を整備する（依存: `next@14.2.3`,`react`,`react-dom` / 開発依存: `typescript`,`@types/*`,`jest`,`jest-environment-jsdom`,`@testing-library/react`,`@testing-library/jest-dom`,`eslint`,`eslint-config-next`）。`scripts`: `dev`/`build`/`start`/`test`/`lint`
- [ ] T004 [P] ESLint 設定を用意する（`backend/.eslintrc.json` = `@typescript-eslint` recommended、`frontend/.eslintrc.json` = `next/core-web-vitals`）。憲法 §1・`.github/workflows/quality-gate.yml` と整合
- [ ] T005 [P] Jest 設定を用意する（`backend/jest.config.js` = `ts-jest`、`frontend/jest.config.js` = `next/jest`）。両方に `coverageThreshold` 80% を設定（[research.md](research.md) D-07）
- [ ] T006 [P] `backend/tsconfig.json` / `frontend/tsconfig.json` を用意する（`strict: true`、`any` 実質禁止＝`tech-stack.md` §8）
- [ ] T007 [P] `backend/Dockerfile` / `frontend/Dockerfile` の development ターゲットを確認・調整する（既存の main 由来ファイルを踏襲）
- [ ] T008 `docker-compose.yml` の backend `environment` に `FRONTEND_ORIGIN=http://localhost:3000` を追加する（[research.md](research.md) D-11）。`.env.example` に不足キーがあれば追記

**Checkpoint**: `docker compose build` が通る

---

## Phase 2: Foundational（ブロッキング前提）

**Purpose**: 全ユーザーストーリーが依存する土台。Phase 3 以降の前に完了必須

### DB

- [ ] T009 `mysql/init/001_schema.sql` を作成する — `books` / `orders` / `order_items` の `CREATE TABLE`（[data-model.md](data-model.md) §2、`DROP`/`TRUNCATE` を置かない＝憲法 §1、インデックス `idx_books_status_id` `uq_orders_order_number` `idx_order_items_order_id` を含む）
- [ ] T010 `mysql/init/002_seed_books.sql` を作成する — `status='selling'` を 20〜30 件＋`status='unlisted'` を数件（既定 `pageSize=12` で2ページ以上）。全書籍の `cover_image_url` は `/images/books/placeholder.svg` に統一（[data-model.md](data-model.md) §6）
- [ ] T010b [P] `frontend/public/images/books/placeholder.svg` を作成する — 書影プレースホルダ画像（単色＋「NO IMAGE」等のシンプルな SVG、外部依存なし）。シード（T010）と一覧/詳細の `<img>` が参照する

### バックエンド基盤

- [ ] T011 `backend/src/config/db.ts` — `mysql2/promise` のコネクションプールを環境変数（`DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`）から生成（[research.md](research.md) D-10）
- [ ] T012 [P] `backend/src/middleware/errorHandler.ts` — 例外を共通形式 `{ error, message, fields? }` に整形（[contracts/README.md](contracts/README.md)）。`NOT_FOUND` / `VALIDATION_ERROR` / `INTERNAL_ERROR`
- [ ] T013 `backend/src/app.ts` — Express アプリ組み立て（`express.json()`、`cors({ origin: FRONTEND_ORIGIN })`、ルータ mount、404 ハンドラ、`errorHandler`）。テストから import 可能に export
- [ ] T014 `backend/src/index.ts` — `app.ts` を `PORT`（既定 4000）で listen（既存ファイルを調整）

### フロントエンド基盤

- [ ] T015 [P] `frontend/lib/api.ts` — `fetch` ラッパ。ベース URL は `NEXT_PUBLIC_API_URL`。非2xx/ネットワーク失敗を `ApiError` に正規化（[research.md](research.md) D-12）
- [ ] T016 [P] `frontend/lib/cart.ts` — `localStorage`（キー `bookstore.cart.v1`）の読み書き。`addItem(bookId)`（既存なら数量+1／CL-002）、`setQuantity`、`removeItem`、`clear`、`readCart`（破損 JSON は空にフォールバック）。[research.md](research.md) D-01/D-03
- [ ] T017 [P] `frontend/lib/cartTotal.ts` — 純関数。`subtotal(price, qty)` と `total(lines)`（整数円の単純合算、送料なし／FR-012・SC-006）
- [ ] T018 [P] `frontend/app/globals.css` + `frontend/app/layout.tsx` — 共通レイアウトとヘッダ（商品一覧／カートへの導線）、色・間隔・フォントの CSS 変数（UI ライブラリ不使用／[research.md](research.md) D-06）
- [ ] T019 [P] `frontend/components/ErrorNotice.tsx` — 汎用エラー表示（定型文、再試行ボタンなし／FR-032・CL-007）
- [ ] T020 [P] `frontend/components/EmptyState.tsx` — 空状態の共通表示（FR-004/FR-016/FR-027）

**Checkpoint**: `docker compose up` で 3 コンテナが起動し、`/api` の 404 とヘルスな空一覧が返せる状態

---

## Phase 3: US1 - 書籍を選んで注文を完了する (P1) 🎯 MVP

**Goal**: 初回訪問から、書籍1冊を選び、有効な3項目を入力して注文番号が出るまでを通しで成立させる

**Independent Test**: [quickstart.md](quickstart.md) §5 の #1〜#4, #7, #10, #11 を順に実施して成功する

### バックエンド（データ層 → ロジック層 → API 層）

- [ ] T021 [P] [US1] `backend/src/repositories/bookRepository.ts` — `findSellingPage(page, pageSize) → { rows, totalItems }`、`findSellingById(id) → Book | null`（プレースホルダ必須）
- [ ] T022 [P] [US1] `backend/src/domain/pricing.ts` — `lineSubtotal(unitPrice, qty)`、`orderTotal(items)`（純関数、[data-model.md](data-model.md) §4）
- [ ] T023 [P] [US1] `backend/src/domain/orderNumber.ts` — `generateOrderNumber() → "ORD-" + <26文字 Crockford Base32>`。48bit ミリ秒タイムスタンプ＋80bit `crypto.randomBytes` を Base32 エンコード。**外部ライブラリ不使用**（`ulid` パッケージは入れない／[research.md](research.md) D-05）
- [ ] T024 [P] [US1] `backend/src/domain/orderValidation.ts` — `validateOrderRequest(body, foundBooks) → { fields }`（必須3項目・メール形式・`items` 非空・`bookId` 実在かつ `selling`・`quantity` 1..99）。[data-model.md](data-model.md) §5
- [ ] T025 [US1] `backend/src/services/bookService.ts` — `pageSize` 既定12・範囲 1..48（外は 400）、`page` 既定1・`>totalPages` は最終ページに丸め、`totalPages = ceil(total/pageSize)`（[contracts/books-list.md](contracts/books-list.md)、[research.md](research.md) D-04）
- [ ] T026 [US1] `backend/src/repositories/orderRepository.ts` — `insertOrder(order, items)` を単一トランザクションで（`orders` → `order_items`）。commit/rollback（[data-model.md](data-model.md) §2.3）
- [ ] T027 [US1] `backend/src/services/orderService.ts` — `bookRepository` で現在値取得 → `orderValidation` → `pricing` で `subtotal`/`total` をサーバ再計算 → `title_snapshot`/`unit_price_snapshot` 生成 → `orderNumber` 発行（重複時最大3回リトライ）→ `orderRepository.insertOrder`（[research.md](research.md) D-08、FR-024a/CL-005）
- [ ] T028 [US1] `backend/src/routes/books.ts` — `GET /api/books`（[contracts/books-list.md](contracts/books-list.md)）、`GET /api/books/:id`（[contracts/books-detail.md](contracts/books-detail.md)、非整数=400／非実在・`unlisted`=404）
- [ ] T029 [US1] `backend/src/routes/orders.ts` — `POST /api/orders`（成功時 201・確定内容返却）、`GET /api/orders/:orderNumber`（[contracts/orders-create.md](contracts/orders-create.md)）

### フロントエンド（ページ → コンポーネント）

- [ ] T030 [P] [US1] `frontend/components/BookCard.tsx` + `frontend/components/BookGrid.tsx` — 書影・タイトル・著者・価格（`Intl.NumberFormat('ja-JP')`／[research.md](research.md) D-09）、クリックで詳細へ（FR-002/FR-003）
- [ ] T031 [US1] `frontend/app/page.tsx` — 商品一覧。`?page=` を URL クエリで保持し `GET /api/books` を呼ぶ。`totalItems=0` は `EmptyState`（FR-001/FR-004）。`components/Pagination.tsx` を新規作成し前/次/先頭/末尾＋現在ページ表示（FR-031）
- [ ] T032 [US1] `frontend/app/books/[id]/page.tsx` — 商品詳細。書影・タイトル・著者・価格・説明文（FR-005）。「カートに追加」で `cart.addItem`（FR-006）、「一覧へ戻る」リンク（FR-007）。404 は「見つかりませんでした」＋一覧へ戻る（FR-008）
- [ ] T033 [P] [US1] `frontend/components/OrderSummary.tsx` — カート行（書名・単価・数量・小計）と合計の表示（カート画面・注文フォームで共用／FR-009/FR-019）
- [ ] T034 [US1] `frontend/app/cart/page.tsx`（基本形）— カート内容と合計を `OrderSummary` で表示。「注文手続きへ」で `/checkout` へ（FR-011/FR-013）。空なら `EmptyState` で手続き不可（FR-016 の基本）
- [ ] T035 [US1] `frontend/app/checkout/page.tsx` + `frontend/components/CheckoutForm.tsx`（基本形）— 氏名・住所・メールの3入力（FR-017）と `OrderSummary`（FR-019）。「注文する」で `POST /api/orders`。201 で `cart.clear()`（FR-020a/CL-004）→ `/order-complete` へ注文番号を渡す（FR-020）
- [ ] T036 [US1] `frontend/app/order-complete/page.tsx` — 注文完了メッセージ（FR-021）、注文番号表示（FR-022）、商品一覧へ戻るリンク（FR-023）。注文番号が無い直接アクセスは一覧へ誘導

### US1 テスト

- [ ] T037 [P] [US1] `backend/tests/unit/` — `pricing`・`orderNumber`（一意性・形式）・`bookService`（ページング丸め・pageSize 範囲）
- [ ] T038 [P] [US1] `backend/tests/integration/books.test.ts` — 一覧（既定/範囲外 page/`unlisted` 除外/空カタログ）、詳細（正常/404/400）（Supertest）
- [ ] T039 [P] [US1] `backend/tests/integration/orders-create.test.ts` — happy path（201・`totalAmount` 再計算一致・スナップショット保存・`orderNumber` 毎回一意）、`GET /api/orders/:orderNumber` 一致
- [ ] T040 [P] [US1] `frontend/tests/unit/` — `cart`（add=+1／clear）、`cartTotal`（小計・合計）
- [ ] T040b [P] [US1] `frontend/tests/components/checkout-page.test.tsx` — 注文成功（201）後にカートが空になること、および**空カート状態で `/checkout` を開く／「注文する」を押すと確定できず案内が出る**こと（[spec.md](spec.md) Edge Cases「注文確定後にブラウザの戻る操作で…」／FR-020a・FR-016）

**Checkpoint**: US1 が単独で通しで動作しテスト green（MVP 完成）

---

## Phase 4: US2 - カートの中身を調整する (P2)

**Goal**: 注文前に数量増減・削除ができ、小計・合計が即時更新される。全削除で空状態

**Independent Test**: [quickstart.md](quickstart.md) §5 の #5, #6 を実施して成功する

- [ ] T041 [P] [US2] `frontend/components/QuantityStepper.tsx` — 数量の＋／−。下限1で止まる、上限99（[research.md](research.md) D-03、FR-015）
- [ ] T042 [P] [US2] `frontend/lib/cart.ts` 拡張 — `setQuantity`（1..99 にクランプ）、`removeItem`、変更後の即時再読込。既に T016 で用意済みなら本タスクは境界値の詰めとテスト観点整理のみ
- [ ] T043 [US2] `frontend/app/cart/page.tsx` 拡張 — 各行に `QuantityStepper` と「削除」を追加。変更で `OrderSummary` の小計・合計を再レンダリング（FR-010/FR-011）。最後の1件を削除したら `EmptyState`（FR-016）
- [ ] T044 [P] [US2] `frontend/tests/unit/cart.test.ts` 追記 — `setQuantity` クランプ、`removeItem`、合計再計算。`frontend/tests/components/cart-page.test.tsx` — 数量変更・削除で合計表示が更新される

**Checkpoint**: US1 + US2 が動作。US1 のテストは引き続き green

---

## Phase 5: US3 - 入力ミスに気づいて修正する (P2)

**Goal**: 必須3項目未入力・メール形式不正で注文が阻止され、どの項目かが示される

**Independent Test**: [quickstart.md](quickstart.md) §5 の #8, #9 と [contracts/orders-create.md](contracts/orders-create.md) の 400 観点を実施して成功する

- [ ] T045 [P] [US3] `frontend/lib/validation.ts` — 送信時バリデーション（氏名/住所: 非空・長さ、メール: 形式・長さ）。純関数でテスト対象（[data-model.md](data-model.md) §5）
- [ ] T046 [US3] `frontend/components/CheckoutForm.tsx` 拡張 — `validation.ts` を送信時に適用。各入力欄に項目別エラー表示、`aria-invalid`／`label` 関連付け（WCAG AA／[research.md](research.md) D-06）。サーバ `400` の `fields`（`name`/`address`/`email`/`items`）を対応欄へマッピング（[research.md](research.md) D-12、FR-018）
- [ ] T047 [P] [US3] `backend/src/domain/orderValidation.ts` 拡張 — `fields` 内訳を [contracts/orders-create.md](contracts/orders-create.md) の表どおりに（空白のみ／256文字以上／`quantity` 非整数・0・100／`items` 空／非実在・`unlisted` `bookId`）。金額フィールドが来ても無視
- [ ] T048 [P] [US3] `backend/tests/integration/orders-validation.test.ts` — 400 全ケース（`name` 空、`email` に `@` なし、`items: []`、非実在/`unlisted` `bookId`、`quantity` 0/100/1.5、`unitPrice`/`totalAmount` 混入時サーバ値で上書き）＋注文レコード未作成の確認
- [ ] T049 [P] [US3] `frontend/tests/` — `validation.ts` 単体、`CheckoutForm` の項目別エラー描画とサーバ `fields` マッピング

**Checkpoint**: US1〜US3 が動作。全ストーリーのテスト green

---

## Phase 6: Polish & Cross-Cutting

- [ ] T050 [P] Edge Cases 詰め — 一覧の範囲外 `page` 丸め（結合テスト）、空カタログの `EmptyState`、長い書名・著者名でレイアウト非破壊、注文後の再送信不可（T040b と対）（[spec.md](spec.md) Edge Cases）
- [ ] T051 [P] 通信エラー表示 — backend 停止時に一覧／詳細／注文送信で `ErrorNotice` が出る（FR-032）。`frontend/tests/components/` に `api` モックでの失敗系
- [ ] T052 [P] アクセシビリティ確認 — フォーカス可視化、`label`、`aria-invalid`、見出し階層（WCAG 2.1 AA 目標／憲法 §3）
- [ ] T053 [P] 画面遷移・エラー・空状態の表現統一レビュー（FR-027）— `ErrorNotice`/`EmptyState` が全画面で使われているか
- [ ] T054 Lint 緑化 — `backend`/`frontend` それぞれに `lint` スクリプトを用意し `npm run lint` エラー0件（憲法 §1）。CI は改変済みの `.github/workflows/quality-gate.yml`（frontend/backend 個別 `working-directory` 実行）で緑化を確認（方針B・2026-09-04 決定）
- [ ] T055 カバレッジ確認 — `npm test -- --coverage` が両パッケージで 80% しきい値を満たす（憲法 §2）
- [ ] T056 [P] `quickstart.md` の §4〜§5 検証表を通しで実施し、結果を記録
- [ ] T057 [P] ドキュメント整合 — 実装で判明した差分を [spec.md](spec.md)/[plan.md](plan.md) に反映（`tech-stack.md` は AI 編集不可。差分は `/speckit.review` で人間に申し送り）

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: 依存なし
- **Phase 2 (Foundational)**: Phase 1 に依存 — 全ユーザーストーリーをブロック
- **Phase 3 (US1 / P1)**: Phase 2 に依存。これ単独で MVP
- **Phase 4 (US2 / P2)**: Phase 3 に依存（`cart.ts`・`app/cart/page.tsx` を拡張するため）
- **Phase 5 (US3 / P2)**: Phase 3 に依存（`CheckoutForm`・`orderValidation` を拡張するため）。Phase 4 とは独立（並行可）
- **Phase 6 (Polish)**: Phase 3〜5 に依存

### ストーリー内の順序

- バックエンド: repositories/domain（純ロジック）→ services → routes
- フロントエンド: lib（純ロジック）→ components → app ページ
- テストは対象実装の直後（または並行）

---

## Parallel Opportunities

- **Phase 1**: T004・T005・T006・T007 は並行可（T002/T003 の後）
- **Phase 2**: T012・T015〜T020 は並行可（T011/T013 と別ファイル）
- **Phase 3**: T021〜T024（別ファイルの純ロジック）は並行可。フロントの T030・T033 は並行可。テスト T037〜T040 は実装後に並行
- **Phase 4 と Phase 5**: 別ストーリー・主対象ファイルが異なるため、Phase 3 完了後は並行して進められる
- **Phase 6**: T050〜T053・T056・T057 は並行可

---

## MVP Scope

**Phase 1 + Phase 2 + Phase 3（US1）** で MVP。書籍の閲覧からカート追加、有効な注文フォーム入力、注文確定・注文番号表示までが通しで動作する。US2（カート編集）と US3（バリデーション表示）は MVP 後の増分。

## Notes

- タスクごと、または論理的なまとまりごとにコミットする
- `tech-stack.md` への追記（テスト/Lint 依存の確定、CSS 方針の明文化、却下選択肢）は**人間の作業**（憲法 §5）。**実装着手前に必須**（[plan.md](plan.md)「実装前ゲート」／T057）
- 注文番号は自前実装（`crypto.randomBytes` + Crockford Base32、26文字）。`ulid` パッケージは追加しない（[research.md](research.md) D-05 / A5）
- 書影はシード・画面とも `frontend/public/images/books/placeholder.svg` を参照（外部 URL 不使用／T010b / A2）
- SQL は必ずプレースホルダ（`?`）。破壊的 DDL を書かない（憲法 §1 / `tech-stack.md` §8）
