---
description: "購買フロー全体（5画面）のタスクリスト"
---

# Tasks: 購買フロー全体（5画面）

**Input**: Design documents from `specs/001-purchase-flow/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, research.md ✅

**Tests**: テストタスクは仕様書に明示的な要求がないため含まない。quickstart.md のシナリオで手動検証する。

**Organization**: タスクはユーザーストーリー単位でグループ化。各ストーリーは独立して実装・テスト可能。

**Note**: specs/002-cart-management の実装で以下のファイルがすでに存在する:
`frontend/src/types/index.ts`, `frontend/src/context/CartContext.tsx`,
`frontend/src/pages/_app.tsx`, `frontend/src/pages/books/[id].tsx`（要更新）,
`frontend/src/components/CartItem.tsx`, `frontend/src/components/CartSummary.tsx`,
`frontend/src/pages/cart.tsx`, `frontend/src/pages/index.tsx`（要更新）

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: どのユーザーストーリーのタスクか（US1, US2, US3）
- 各タスクには正確なファイルパスを含める

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: バックエンドプロジェクトとフロントエンドAPIクライアントの準備。フロントエンド基盤は 002-cart-management で作成済み。

- [x] T001 backend/package.json を新規作成し express・cors・mysql2・typescript・@types/express・@types/cors・@types/node・ts-node 依存を定義する
- [x] T002 [P] backend/tsconfig.json を新規作成する（target: ES2020, module: commonjs, strict: true, outDir: dist）
- [x] T003 [P] backend/.env.example を新規作成し DB_HOST・DB_PORT・DB_USER・DB_PASSWORD・DB_NAME・PORT の環境変数テンプレートを定義する（実際の .env はコミットしない）
- [x] T004 [P] backend/database/migrations/001_create_books.sql を新規作成し books テーブルの DDL を記述する（data-model.md の DDL に基づく）
- [x] T005 [P] backend/database/migrations/002_create_orders.sql を新規作成し orders・order_items テーブルの DDL を記述する（data-model.md の DDL に基づく）
- [x] T006 [P] frontend/src/services/book_api.ts を新規作成し GET /api/books・GET /api/books/:id を呼び出す fetchBooks()・fetchBook(id) 関数を実装する（contracts/books-api.md に準拠）
- [x] T007 [P] frontend/src/services/order_api.ts を新規作成し POST /api/orders を呼び出す createOrder() 関数を実装する（contracts/orders-api.md に準拠）
- [x] T008 [P] frontend/src/components/BookCard.tsx を新規作成し書籍の書影・タイトル・著者・価格を表示するカードUIを実装する（クリックで /books/:id へ遷移）

---

## Phase 2: Foundational（バックエンドインフラ — 全ストーリーの前提）

**Purpose**: Express サーバー・DBモデル・サービス層の構築。このフェーズ完了まで US1・US3 の API が使用できない。

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [P] backend/src/models/book.ts を新規作成し Book 型定義と mysql2 を使った書籍一覧（findAll）・書籍詳細（findById）DB操作関数を実装する
- [x] T010 [P] backend/src/models/order.ts を新規作成し Order・OrderItem 型定義と注文INSERT・注文番号採番（ORD-{YYYYMMDD}-{id}形式）関数を実装する
- [x] T011 backend/src/services/book_service.ts を新規作成し book モデルの findAll・findById を呼び出す getBooks()・getBook(id) サービス関数を実装する（T009 完了後）
- [x] T012 backend/src/services/order_service.ts を新規作成し order モデルを使った createOrder() サービス関数（バリデーション含む）を実装する（T010 完了後）
- [x] T013 [P] backend/src/api/books.ts を新規作成し GET /api/books・GET /api/books/:id エンドポイントを実装して book_service を呼び出す（contracts/books-api.md に準拠、T011 完了後）
- [x] T014 [P] backend/src/api/orders.ts を新規作成し POST /api/orders エンドポイントを実装して order_service を呼び出す（contracts/orders-api.md のレスポンス形式に準拠、T012 完了後）
- [x] T015 backend/index.ts を新規作成し Express サーバーを初期化し cors・json middleware を適用して books・orders ルーターをマウントする（T013・T014 完了後）

**Checkpoint**: `node -r ts-node/register backend/index.ts` で Express が起動し GET /api/books が 200 を返すこと

---

## Phase 3: User Story 1 - 書籍を探してカートに追加する (Priority: P1) 🎯 MVP

**Goal**: 商品一覧（/）でグリッド表示された書籍を閲覧し、書籍詳細（/books/:id）で内容確認後に「カートに追加」ができる。

**Independent Test**: バックエンドとDBが起動した状態で http://localhost:3000/ を開き書籍一覧が表示されること。書籍をクリックして詳細が表示され「カートに追加」を押すと一覧に戻り /cart に追加書籍が確認できること（[quickstart.md](quickstart.md) Step1〜Step3）

### Implementation for User Story 1

- [x] T016 [US1] frontend/src/pages/index.tsx を更新し直接 fetch から fetchBooks()（book_api.ts）に変更し BookCard コンポーネントを使って書籍一覧をグリッド表示する（T006・T008 完了後）
- [x] T017 [US1] frontend/src/pages/books/[id].tsx を更新し直接 fetch から fetchBook(id)（book_api.ts）に変更して書籍詳細を表示し「カートに追加」ボタンは変更不要（T006 完了後）

**Checkpoint**: 書籍一覧→詳細→カート追加の3ステップが単独で動作する

---

## Phase 4: User Story 2 - カートの内容を確認・調整する (Priority: P2)

**Goal**: カート画面（/cart）で書名・単価・数量・小計・合計を表示し、数量変更・削除・注文手続きへの導線が機能する。

**Independent Test**: カートに書籍を追加した状態で /cart を開き、数量変更・削除・合計リアルタイム更新が動作すること。「注文手続きへ」ボタンで /order へ遷移すること（[quickstart.md](quickstart.md) Step4）

### Implementation for User Story 2

- [x] T018 [US2] frontend/src/pages/cart.tsx が 001-purchase-flow 仕様（FR-004〜FR-007）と合致していることを確認し「注文手続きへ」ボタン（`router.push('/order')`）が実装されていることを検証・必要なら修正する（002-cart-management 実装済みのため、確認のみで完了の可能性が高い）

**Checkpoint**: US1・US2 が組み合わさってカート追加〜数量調整の完全なフローが動作する

---

## Phase 5: User Story 3 - 注文情報を入力して注文を確定する (Priority: P3)

**Goal**: 注文フォーム（/order）でカート内容確認しながら氏名・住所・メール入力→バリデーション→注文確定→注文番号表示（/order/complete）。

**Independent Test**: カートに書籍がある状態で /order へ遷移し全項目入力して「注文する」を押すと /order/complete に注文番号が表示されること。未入力・メール形式不正でエラーが表示されること（[quickstart.md](quickstart.md) Step5〜Step6・個別シナリオ）

### Implementation for User Story 3

- [x] T019 [P] [US3] frontend/src/components/OrderForm.tsx を新規作成し氏名・住所・メールアドレスの入力フィールドとバリデーション（必須・メール形式チェック）・フィールド個別エラーメッセージ表示を実装し、送信時に `onSubmit` コールバックを呼び出す
- [x] T020 [US3] frontend/src/pages/order.tsx を新規作成し CartSummary（注文内容確認）と OrderForm を同一画面に表示する。カートが空の場合は /cart へリダイレクトし、「注文する」押下で order_api.ts の createOrder() を呼び出し成功時に /order/complete?orderNumber=xxx へ遷移する（T019・T007 完了後）
- [x] T021 [US3] frontend/src/pages/order/complete.tsx を新規作成し URL クエリパラメータから orderNumber を取得して注文完了メッセージと注文番号を表示し「商品一覧へ戻る」リンク（/）を設ける

**Checkpoint**: US1〜US3 がすべて組み合わさって商品一覧→注文完了の正常系フルフローが動作する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 運用準備・横断的な品質向上

- [x] T022 [P] docker-compose.yml をプロジェクトルートに新規作成し frontend（3000）・backend（4000）・mysql（3306）の3サービスを定義しボリューム・環境変数を設定する
- [x] T023 [P] backend/database/seeds/001_books.sql を新規作成し動作確認用のサンプル書籍データ（5〜10件）を INSERT する
- [x] T024 [P] backend/index.ts に存在しない API パス（/api/* 以外）へのリクエストに対して 404 を返すフォールバック処理を追加する
- [ ] T025 `npm run dev`（frontend）と `node -r ts-node/register backend/index.ts`（backend）を起動して [quickstart.md](quickstart.md) の正常系フロー（Step1〜Step6）と個別シナリオ（バリデーション2種・空カートリダイレクト）を手動で実行して動作確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。即座に全タスク並列開始可能
- **Foundational (Phase 2)**: Phase 1 完了後。T009・T010 は並列、T011 は T009 後、T012 は T010 後、T013 は T011 後、T014 は T012 後、T015 は T013・T014 後
- **User Story 1 (Phase 3)**: Phase 2 完了後（バックエンドAPI必要）
- **User Story 2 (Phase 4)**: Phase 2 完了後（確認作業のみ、Phase 3 と並列可能）
- **User Story 3 (Phase 5)**: Phase 2・Phase 4 完了後（カートと注文が連携するため）
- **Polish (Phase 6)**: Phase 5 完了後

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完了後に開始可能
- **User Story 2 (P2)**: Foundational 完了後に開始可能（US1 と並列可能）
- **User Story 3 (P3)**: US2 の確認完了後に開始（/cart→/order の連携のため）

### Within Each User Story

- T016 と T017 は並列実行可能（異なるファイル、T006 完了後）
- T019 と T021 は並列実行可能（異なるファイル）
- T020 は T019・T007 完了後（OrderForm・order_api を使用するため）

### Parallel Opportunities

```bash
# Phase 1（全タスク並列）
T001 backend/package.json
T002 backend/tsconfig.json
T003 backend/.env.example
T004 backend/migrations/001_create_books.sql
T005 backend/migrations/002_create_orders.sql
T006 frontend/services/book_api.ts
T007 frontend/services/order_api.ts
T008 frontend/components/BookCard.tsx

# Phase 2
T009 backend/models/book.ts      ─┐ 並列
T010 backend/models/order.ts     ─┘
T011 backend/services/book_service.ts  (T009 後)
T012 backend/services/order_service.ts (T010 後)
T013 backend/api/books.ts        ─┐ 並列（T011・T012 後）
T014 backend/api/orders.ts       ─┘
T015 backend/index.ts            (T013・T014 後)

# Phase 3
T016 frontend/pages/index.tsx    ─┐ 並列（T006 後）
T017 frontend/pages/books/[id].tsx ─┘

# Phase 5
T019 frontend/components/OrderForm.tsx ─┐ 並列
T021 frontend/pages/order/complete.tsx ─┘
T020 frontend/pages/order.tsx          (T019・T007 後)

# Phase 6
T022 docker-compose.yml         ─┐
T023 backend/seeds/001_books.sql ─┤ 並列
T024 backend/index.ts 404追加    ─┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: T001〜T008（設定・クライアント準備）
2. Phase 2: T009〜T015（バックエンド構築）
3. Phase 3: T016〜T017（書籍一覧・詳細ページ更新）
4. **STOP and VALIDATE**: 商品一覧→詳細→カート追加の単独動作確認
5. US2 は 002-cart-management 実装済みのため即座に利用可能

### Incremental Delivery

1. Phase 1 + 2 → バックエンドAPI稼働（curl でテスト可能）
2. Phase 3 (US1) → 書籍閲覧・カート追加（フロントエンド完成形）
3. Phase 4 (US2) → カート確認・調整（002 実装済み確認）
4. Phase 5 (US3) → 注文確定・注文番号取得（フル購買フロー完成）
5. Phase 6 → 運用準備（Docker Compose・シードデータ）

---

## Notes

- [P] タスク = 異なるファイル、互いに依存なし
- [Story] ラベルはタスクをユーザーストーリーにトレース可能にする
- 002-cart-management 実装済みファイルはこのタスクリストに重複記載しない（T018 のみ確認タスクとして残す）
- T015（backend/index.ts）は T013・T014 完了後に作成する。ルーターのインポートパスが確定してから実装する
- DB接続情報は必ず .env から読み込む。コードへの直書きは厳禁（憲法 III章）
