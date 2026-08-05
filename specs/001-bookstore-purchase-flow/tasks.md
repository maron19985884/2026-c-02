# Tasks: 個人運営オンライン書店（購買フロー特化版）

**Input**: `specs/001-bookstore-purchase-flow/`（spec.md, plan.md, research.md, data-model.md, contracts/）

**Tests**: 憲法2章（テスト基準）により単体テストは必須。各ユーザーストーリーに単体テストタスクを含める（TDD: 実装タスクより前に配置）。

**Organization**: ユーザーストーリー単位（spec.mdのP1〜P4）でグループ化。

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup（共通基盤）

- [X] T001 plan.mdのProject Structureに沿って `backend/` `frontend/` のディレクトリを作成する
- [X] T002 [P] `backend/package.json` `backend/tsconfig.json` を作成し、TypeScript + Express + better-sqlite3 + Jest を依存関係に追加する
- [X] T003 [P] `frontend/package.json` `frontend/tsconfig.json` を作成し、Next.js + React + TypeScript + Jest + React Testing Library を依存関係に追加する
- [X] T004 [P] `backend/.eslintrc.json` を作成する（`docs/tech-stack-template.md` のLint方針に準拠）
- [X] T005 [P] `frontend/.eslintrc.json` を作成する
- [X] T006 [P] `backend/Dockerfile` を作成する
- [X] T007 [P] `frontend/Dockerfile` を作成する
- [X] T008 リポジトリ直下に `docker-compose.yml` を作成し、backend・frontendをローカル起動できるようにする（quickstart.md想定のポート: frontend 3000 / backend 4000）

**Checkpoint**: `docker compose up` でフロント・バックのコンテナが（中身は空でも）起動する

---

## Phase 2: Foundational（全ユーザーストーリーの前提・ブロッキング）

**⚠️ CRITICAL**: このフェーズが完了するまでUser Story の実装に着手しない

- [X] T009 `backend/src/db/schema.ts` にSQLiteスキーマ初期化処理を実装する（`design/table-definition.html` の books / orders / order_items）
- [X] T010 `backend/src/db/seed.ts` に書籍シードデータ投入処理を実装する（research.md「5. 書籍データの投入方法」、12件のダミー書籍）
- [X] T011 [P] `backend/src/models/book.ts` `backend/src/models/order.ts` にBook/Order/OrderItemの型定義を作成する（data-model.md準拠）
- [X] T012 [P] `backend/src/api/index.ts` にExpressアプリとルーティングの土台を実装する
- [X] T013 [P] `frontend/src/contexts/CartContext.tsx` にカート状態管理の土台（Provider, 空の`items`初期値）を実装する
- [X] T014 [P] `frontend/src/services/apiClient.ts` にバックエンドAPI呼び出しの共通クライアントを実装する

**Checkpoint**: DB初期化・シード投入・APIサーバー起動・カートContextの土台が揃い、各ユーザーストーリーの実装に着手できる

---

## Phase 3: User Story 1 - 商品を探してカートに入れる (Priority: P1) 🎯 MVP

**Goal**: 商品一覧→商品詳細→カート追加までが動作する

**Independent Test**: `docker compose up` 後、一覧画面から任意の商品をクリックして詳細を表示し、「カートに追加」を押して一覧に戻れることを確認する

### Tests for User Story 1

- [X] T015 [P] [US1] `backend/tests/unit/bookService.test.ts` に `bookService.listBooks` / `getBookById`（存在しないIDで404相当を返すこと含む）の単体テストを作成する
- [X] T016 [P] [US1] `addItem` の単体テスト（新規追加／同一書籍は数量加算＝FR-021）を作成する。実装時にカートロジックを`frontend/src/lib/cart.ts`の純粋関数として切り出したため、テストは`frontend/tests/unit/cart.test.ts`に配置（React依存なしでテストできるようにするための設計変更）

### Implementation for User Story 1

- [X] T017 [P] [US1] `backend/src/services/bookService.ts` を実装する（T015のテストを通す）
- [X] T018 [US1] `backend/src/api/books.ts` に `GET /api/books` `GET /api/books/:id` を実装する（`contracts/books-api.md`準拠、T017に依存）
- [X] T019 [P] [US1] `frontend/src/pages/index.tsx`（商品一覧画面）を実装する（FR-001, FR-002）
- [X] T020 [P] [US1] `frontend/src/pages/books/[id].tsx`（商品詳細画面）を実装する（FR-003, FR-004）
- [X] T021 [US1] `frontend/src/lib/cart.ts` の `addItem` と `CartContext.tsx` の `addBook` を実装する（T016のテストを通す、FR-005, FR-021）
- [X] T022 [US1] 「カートに追加」後に商品一覧へ戻れる導線を実装する（FR-006）

**Checkpoint**: User Story 1が単独で動作・検証できる（MVP）

---

## Phase 4: User Story 2 - カートの中身を確認・調整する (Priority: P2)

**Goal**: カート画面で数量変更・削除・合計金額のリアルタイム反映ができる

**Independent Test**: 商品が1件以上入ったカート画面を開き、数量変更・削除それぞれで小計・合計金額が即時更新されることを確認する

### Tests for User Story 2

- [X] T023 [P] [US2] `increaseQuantity` / `decreaseQuantity`（数量1で非活性化＝FR-022） / `removeItem` / 合計金額計算の単体テストを作成する（`frontend/tests/unit/cart.test.ts`、T016と同様の設計変更）

### Implementation for User Story 2

- [X] T024 [US2] `frontend/src/lib/cart.ts` に `increaseQuantity` / `decreaseQuantity` / `removeItem` / `cartTotal` を実装し、`CartContext.tsx` から利用する（T023のテストを通す）
- [X] T025 [US2] `frontend/src/pages/cart.tsx`（カート画面）を実装する（FR-007, FR-008, FR-009, FR-010）
- [X] T026 [US2] カートが空の場合に「注文手続きに進む」導線を非表示にするロジックを実装する（FR-020）

**Checkpoint**: User Story 1 + 2 が独立して動作する

---

## Phase 5: User Story 3 - 注文情報を入力して確定する (Priority: P3)

**Goal**: 注文フォームの入力・バリデーション・注文確定ができる

**Independent Test**: カートに商品がある状態で注文フォームを開き、未入力・形式不正でエラー表示、正しい入力で注文が確定することを確認する

### Tests for User Story 3

- [X] T027 [P] [US3] `frontend/tests/unit/validation.test.ts` に必須チェック・メール形式チェックの単体テストを作成する
- [X] T028 [P] [US3] `backend/tests/unit/orderValidation.test.ts` にサーバー側バリデーション（必須・メール形式・items非空＝FR-020）の単体テストを作成する
- [X] T029 [P] [US3] `backend/tests/unit/orderNumber.test.ts` に注文番号採番（`ORD-YYYYMMDD-NNNN`形式、一意性）の単体テストを作成する
- [X] T030 [P] [US3] `backend/tests/unit/orderService.test.ts` に `orderService.createOrder`（合計金額計算・スナップショット保存）の単体テストを作成する

### Implementation for User Story 3

- [X] T031 [P] [US3] `frontend/src/lib/validation.ts` を実装する（T027のテストを通す、FR-013）
- [X] T032 [P] [US3] `backend/src/services/orderValidation.ts` `backend/src/services/orderNumber.ts` を実装する（T028, T029のテストを通す）
- [X] T033 [US3] `backend/src/services/orderService.ts` の `createOrder` を実装する（T030のテストを通す、T032に依存）
- [X] T034 [US3] `backend/src/api/orders.ts` に `POST /api/orders` を実装する（`contracts/orders-api.md`準拠、T033に依存）
- [X] T035 [US3] `frontend/src/components/OrderForm.tsx` と `frontend/src/pages/order.tsx`（注文フォーム画面）を実装する（FR-012, FR-013, FR-014, FR-015）

**Checkpoint**: User Story 1〜3 が独立して動作する

---

## Phase 6: User Story 4 - 注文完了を確認する (Priority: P4)

**Goal**: 注文完了画面で完了メッセージ・注文番号を確認し、一覧に戻れる

**Independent Test**: 注文確定直後の状態で完了画面を開き、メッセージ・注文番号の表示と「商品一覧へ戻る」導線を確認する

### Tests for User Story 4

- [X] T036 [P] [US4] 注文番号・完了メッセージの表示ロジックの単体テストを作成する（`frontend/tests/unit/OrderCompleteMessage.test.tsx`。表示ロジックを`frontend/src/components/OrderCompleteMessage.tsx`に切り出してテスト容易性を確保）

### Implementation for User Story 4

- [X] T037 [US4] `frontend/src/pages/order-complete.tsx`（注文完了画面）と `frontend/src/components/OrderCompleteMessage.tsx` を実装する（FR-016, FR-017, FR-018、T036のテストを通す）
- [X] T038 [US4] 注文確定（`POST /api/orders`のレスポンス）を`sessionStorage`経由で注文完了画面へ受け渡す画面遷移を実装する（US3のT034, T035に依存）

**Checkpoint**: 全User Story（購買フロー全体）が独立かつ一連で動作する

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T039 [P] `backend` `frontend` それぞれで ESLint を実行し、エラー0件にする（憲法1章、`.github/workflows/quality-gate.yml`）※Node.js/npm実行環境が必要。Phase 5で実施
- [ ] T040 [P] 単体テストカバレッジを計測し、憲法2章の目標（80%以上）を満たしているか確認する（Phase 5で詳細実施）※同上
- [ ] T041 `quickstart.md` の検証シナリオ12項目を実施できる状態まで通しで動作確認する（Phase 6で詳細実施）※Docker実行環境が必要。Phase 6で実施

---

## Dependencies & Execution Order

- **Setup（Phase 1）**: 依存なし。即着手可能
- **Foundational（Phase 2）**: Setup完了後。全User Storyをブロックする
- **User Story 1（Phase 3）**: Foundational完了後。他ストーリーへの依存なし（MVP）
- **User Story 2（Phase 4）**: Foundational完了後。CartContextはUS1で土台実装済みのため、US1完了後の着手を推奨
- **User Story 3（Phase 5）**: Foundational完了後。カート合計金額の表示にUS2の完了を推奨
- **User Story 4（Phase 6）**: US3（T034, T035）完了後（注文確定APIとフォームがないと完了画面に渡す情報がない）
- **Polish（Phase 7）**: 全User Story完了後

## Implementation Strategy

### MVP First

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1 → ここで一覧・詳細・カート追加のMVPとして動作確認可能
4. Phase 4〜6: User Story 2〜4を優先順位順に追加
5. Phase 7: Polish（Lint・カバレッジ・quickstart通し確認）

### Parallel Example: User Story 1

```bash
# US1のテストを並行して用意
Task: "backend/tests/unit/bookService.test.ts の単体テストを作成"
Task: "frontend/tests/unit/CartContext.test.tsx の addItem 単体テストを作成"

# US1の画面実装を並行して進める
Task: "frontend/src/pages/index.tsx（商品一覧画面）を実装"
Task: "frontend/src/pages/books/[id].tsx（商品詳細画面）を実装"
```

## Notes

- [P] タスクは異なるファイルを対象とし、依存関係がないため並行実施可能
- 各User Storyのテストタスクは対応する実装タスクより前に完了させる（TDD）
- チェックポイントごとに、そのUser Storyが単独で動作するか確認してから次へ進む
