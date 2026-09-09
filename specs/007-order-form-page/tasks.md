---
description: "Task list for 注文フォーム画面 (007-order-form-page)"
---

# Tasks: 注文フォーム画面

**Input**: Design documents from `/specs/007-order-form-page/`
**Prerequisites**: [plan.md](./plan.md)（必須）, [spec.md](./spec.md)（必須）, [research.md](./research.md), [data-model.md](./data-model.md), [contracts/orders-api.md](./contracts/orders-api.md), [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- ファイルパスは `plan.md` の Structure Decision（Option 2: frontend/backend 分離。本機能は初めてバックエンド・MySQLへの変更を伴う）に従う

---

## Phase 1: Setup（プロジェクト基盤）

**Purpose**: 本機能固有の環境設定

- [x] T001 [P] `docker-compose.yml` の `frontend` サービスの `environment` に `NEXT_PUBLIC_API_URL=http://localhost:4000` を追加する（ブラウザから直接 `backend` を呼び出すため、[research.md](./research.md) D-03）

---

## Phase 2: Foundational（共通基盤・全ユーザーストーリーの前提）

**Purpose**: 複数のユーザーストーリーから参照される共通基盤

- [x] T002 [P] `mysql/init/02_orders.sql` を新規作成する。`orders` / `order_items` テーブルを `CREATE TABLE IF NOT EXISTS` で定義する（[data-model.md](./data-model.md)。破壊的DDLは使用しない、憲法§1）
- [x] T003 [P] `backend/src/types/order.ts` を新規作成する。`Order` / `OrderItem` / `CreateOrderRequest` / `CreateOrderResponse` 型を定義する（[data-model.md](./data-model.md), [contracts/orders-api.md](./contracts/orders-api.md)）
- [x] T004 [P] `frontend/src/types/order.ts` を新規作成する。`CustomerInfo` / `OrderFormErrors` / `CreateOrderResponse` 型を定義する（[data-model.md](./data-model.md)）

**Checkpoint**: 基盤（DBスキーマ・型定義）が整い、各ユーザーストーリーの実装に着手できる

---

## Phase 3: User Story 1 - 顧客情報を入力する (Priority: P1) 🎯 MVP

**Goal**: 注文フォーム画面に氏名・住所・メールアドレスの入力欄（いずれも単一欄）を表示し、値を入力できるようにする。カートが空の場合はカート画面へ差し戻す（REQ-012, FR-001, FR-002, FR-012, FR-013, FR-014）

**Independent Test**: カート画面から注文フォーム画面へ遷移し、氏名・住所・メールアドレスの3項目の入力欄が表示され、それぞれに値を入力できることを確認する。カートが空の状態で `/order` に直接アクセスすると `/cart` へ差し戻されることも確認する（[quickstart.md](./quickstart.md) 手順1, 2）

- [x] T005 [US1] `frontend/src/app/order/page.tsx`（＋`frontend/src/app/order/page.module.css`）を新規作成する。`useCart()` から `items` を取得し、ロード完了後に `items.length === 0` なら `useRouter().replace("/cart")` でカート画面へ差し戻す（FR-012, [research.md](./research.md) D-04）。それ以外の場合はフォーム・注文内容確認を配置する画面の骨組みを実装する
- [x] T006 [P] [US1] `frontend/src/components/OrderForm.tsx`（＋`OrderForm.module.css`）を新規作成する。氏名・住所・メールアドレスの入力欄（それぞれ単一欄、FR-013, FR-014）を表示し、入力値をコンポーネント内state（`CustomerInfo`）で管理する。「注文する」ボタンを配置する（送信処理は後続フェーズで追加）（FR-001, FR-002）
- [x] T007 [US1] `frontend/src/app/order/page.tsx` に `OrderForm` を組み込む（T005完了後）
- [x] T008 [P] [US1] `frontend/tests/unit/OrderForm.test.tsx` を新規作成する。氏名・住所・メールアドレスの入力欄が表示され、それぞれに値を入力すると反映されることを検証する単体テストを実装する（憲法§2）
- [x] T009 [P] [US1] `frontend/tests/unit/OrderPage.test.tsx` を新規作成する。カートが空のとき `/cart` へ `replace` されること、1件以上のとき通常どおり画面が表示されることを検証するテストを実装する（FR-012, 憲法§2）

**Checkpoint**: User Story 1 が単独で動作・検証可能（顧客情報入力欄の表示・空カード時の差し戻し）

---

## Phase 4: User Story 2 - 入力内容のバリデーションを確認する (Priority: P1)

**Goal**: 氏名・住所・メールアドレスの入力に不備がある場合、「注文する」ボタン押下時にエラーメッセージを表示し、注文を確定させない（REQ-013, FR-003, FR-004, FR-005）

**Independent Test**: 氏名・住所・メールアドレスのいずれかを未入力のまま、またはメールアドレスを不正な形式で入力した状態で「注文する」を押し、エラーメッセージが表示され注文が確定しないことを確認する（[quickstart.md](./quickstart.md) 手順3）

- [x] T010 [P] [US2] `frontend/src/lib/validateOrderForm.ts` を新規作成する。`CustomerInfo` を受け取り、氏名・住所・メールアドレスの必須チェックとメールアドレスの形式チェック（`xxx@yyy`形式）を行い、フィールドごとのエラーメッセージ（`OrderFormErrors`）を返す純粋関数 `validateOrderForm` を実装する（FR-003, FR-004, FR-005, [data-model.md](./data-model.md), tech-stack.md §7 命名例）
- [x] T011 [P] [US2] `frontend/tests/unit/validateOrderForm.test.ts` を新規作成する。各項目が未入力の場合にエラーが返ること、メールアドレスの形式が不正な場合にエラーが返ること、すべて正しい場合はエラーなしを返すことを検証する単体テストを実装する（憲法§2）
- [x] T012 [US2] `frontend/src/components/OrderForm.tsx` の「注文する」ボタン押下時に `validateOrderForm` を呼び出し、エラーがあれば該当フィールドの近傍にエラーメッセージを表示して送信を中断し、エラーがなければ `props.onValidSubmit(customerInfo)` を呼び出す処理を実装する（FR-003, FR-004, FR-005）
- [x] T013 [US2] `frontend/tests/unit/OrderForm.test.tsx` に、未入力時・メールアドレス形式不正時にエラーメッセージが表示され `onValidSubmit` が呼ばれないこと、修正後に再送信するとエラーが消え `onValidSubmit` が呼ばれることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 2 が単独で動作・検証可能（バリデーション・エラー表示）

---

## Phase 5: User Story 3 - 注文内容を同一画面で確認する (Priority: P1)

**Goal**: 注文フォーム画面と同一画面内に、カートに入っている注文対象の書籍と合計金額を読み取り専用で表示する（REQ-014, FR-006, FR-007）

**Independent Test**: カートに書籍が複数件入った状態で注文フォーム画面を開き、顧客情報の入力欄と同じ画面内に注文商品（カート内容）と合計金額が表示されることを確認する（[quickstart.md](./quickstart.md) 手順4）

- [x] T014 [P] [US3] `frontend/src/components/OrderSummary.tsx`（＋`OrderSummary.module.css`）を新規作成する。`useCart()` の `items` と既存の `calcCartTotal` を用いて、書名・数量・小計・合計金額を読み取り専用で一覧表示するコンポーネントを実装する（FR-006）
- [x] T015 [US3] `frontend/src/app/order/page.tsx` に `OrderSummary` を組み込み、`OrderForm` と同一画面内に表示する（T007完了後。FR-007）
- [x] T016 [P] [US3] `frontend/tests/unit/OrderSummary.test.tsx` を新規作成する。カート内の各書籍（書名・数量・小計）と合計金額が表示され、各行の小計の総和と一致することを検証するテストを実装する（憲法§2）

**Checkpoint**: User Story 3 が単独で動作・検証可能（注文内容の同画面確認）

---

## Phase 6: User Story 4 - 注文を確定する (Priority: P1)

**Goal**: 氏名・住所・メールアドレスに不備がなければ「注文する」ボタン1つで注文を確定し（MySQLへ永続化）、注文完了画面へ遷移する。確定失敗時はエラーメッセージを表示し入力内容を保持する（REQ-015, FR-008, FR-009, FR-010）

**Independent Test**: 氏名・住所・メールアドレスをすべて正しく入力した状態で「注文する」ボタンを押し、`/order/complete/<注文番号>` へ遷移し、`orders` / `order_items` テーブルに保存されることを確認する（[quickstart.md](./quickstart.md) 手順5, 6）

### バックエンド

- [x] T017 [P] [US4] `backend/src/lib/generateOrderNumber.ts` を新規作成する。`crypto.randomBytes` を用いてULID風・Base32・26文字の注文番号を生成する関数 `generateOrderNumber()` を実装する（[research.md](./research.md) D-01。`ulid`パッケージは使用しない、tech-stack.md §6）
- [x] T018 [P] [US4] `backend/tests/unit/generateOrderNumber.test.ts` を新規作成する。生成される文字列が26文字であること、複数回呼び出すと異なる値になることを検証する単体テストを実装する（憲法§2）
- [x] T019 [US4] `backend/src/services/orderService.ts` を新規作成する。`bookId` ごとに既存の `fetchBookById`（`bookService.ts`）で書籍を参照し、単価・書名をサーバー側でスナップショットし、合計金額を算出したうえで、`pool.getConnection()` によるトランザクション内で `orders` / `order_items` にINSERTする `createOrder` 関数を実装する。存在しない `bookId` が含まれる場合はエラーを投げてロールバックする（[research.md](./research.md) D-02, [data-model.md](./data-model.md)。SQL文字列へのリクエスト値の直接連結禁止、プレースホルダ必須、tech-stack.md §8）
- [x] T020 [P] [US4] `backend/tests/unit/orderService.test.ts` を新規作成する。複数明細の合計金額が正しく算出されること、存在しない `bookId` を含む場合にエラーとなり注文が作成されないことを検証する単体テストを実装する（憲法§2）
- [x] T021 [US4] `backend/src/api/ordersRouter.ts` を新規作成する。`POST /` でリクエストボディの最小限のバリデーション（必須項目の欠落・空文字、`items` が空配列、`quantity` が1未満）を行い400を返す。妥当な場合は `orderService.createOrder` を呼び出し、成功時は201で `orderNumber` / `totalAmount` を返し、その他のエラー時は500を返す（[contracts/orders-api.md](./contracts/orders-api.md), [research.md](./research.md) D-06）
- [x] T022 [US4] `backend/src/index.ts` に `ordersRouter` を `/api/orders` にマウントする（T021完了後）
- [x] T023 [P] [US4] `backend/tests/integration/ordersApi.test.ts` を新規作成する。[contracts/orders-api.md](./contracts/orders-api.md) の契約テストの観点（正常系201・DB保存・各種400・価格改ざん防止）を検証する結合テストを実装する

### フロントエンド

- [x] T024 [P] [US4] `frontend/src/lib/api/orders.ts` を新規作成する。ブラウザから `NEXT_PUBLIC_API_URL` を用いて `POST /api/orders` を呼び出す `createOrder` 関数を実装する（[research.md](./research.md) D-03）
- [x] T025 [US4] `frontend/src/context/CartContext.tsx` に `clearCart()`（`items` を空配列にし `localStorage` も更新）を追加する（[research.md](./research.md) D-05）
- [x] T026 [P] [US4] `frontend/tests/unit/CartContext.test.tsx` に `clearCart()` の単体テストを追加する（憲法§2）
- [x] T027 [US4] `frontend/src/app/order/page.tsx` の `onValidSubmit` ハンドラで `createOrder` を呼び出す。成功時は `clearCart()` を呼び `router.push(`/order/complete/${orderNumber}`)` へ遷移し、失敗時は `ErrorNotice` でエラーメッセージを表示し入力済みの顧客情報を保持する（T007, T015完了後。FR-008, FR-009, FR-010, [research.md](./research.md) D-05, D-07）
- [x] T028 [US4] `frontend/tests/unit/OrderPage.test.tsx` に、送信成功時に `/order/complete/<orderNumber>` へ遷移し `clearCart()` が呼ばれること、送信失敗時にエラーメッセージが表示され入力内容が保持されることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 4 が単独で動作・検証可能（注文確定・永続化・完了画面への遷移・失敗時のエラー表示）

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T029 [P] `frontend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T030 [P] `backend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T031 [P] `frontend` / `backend` それぞれの Jest カバレッジが80%以上であることを確認する（憲法§2、tech-stack.md §3）
- [x] T032 [quickstart.md](./quickstart.md) の検証手順（顧客情報入力・空カード差し戻し・バリデーション・注文内容確認・注文確定・DB保存・API失敗時のエラー表示）を通しで実行し、結果を確認する

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: 依存なし。T001は他タスクと並列可（US4のフロントエンドから利用する環境変数の追加のみ）
- **Foundational (Phase 2)**: Setupの後に着手可能。T002〜T004は異なるファイルのため並列可。US1〜US4のいずれの実装にも先立って完了させる
- **User Story 1 (Phase 3)**: Foundational完了後に着手。T005→T007（`page.tsx`の縦の依存）。T006（`OrderForm`）はT005と並列可。T008（`OrderForm`テスト）はT006完了後。T009（`OrderPage`テスト）はT005完了後
- **User Story 2 (Phase 4)**: Phase 3完了後に着手（同一ファイル`OrderForm.tsx`を編集するため）。T010→T012の順（T012はT006・T010完了後）。T011（`validateOrderForm`テスト）はT010完了後、T013（`OrderForm`テスト追加）はT012完了後、それぞれ独立して並列可
- **User Story 3 (Phase 5)**: Phase 3のT005（`page.tsx`の骨組み）完了後に着手可能（US2と並行実装も可）。T014（`OrderSummary`）は他ユーザーストーリーと独立して並列可。T015（`page.tsx`への組み込み）はT007・T014完了後。T016はT014完了後
- **User Story 4 (Phase 6)**: バックエンド側（T017〜T023）はFoundational（T002, T003）完了後、他ユーザーストーリーと独立して並列着手可能。フロントエンド側は、`orderService`が完了済みであること（T019）と、Phase 3・Phase 5の`page.tsx`統合（T007, T015）が完了していることが前提。T017→T019（`orderService`が`generateOrderNumber`を利用）、T019→T021（`ordersRouter`が`orderService`を利用）→T022。T024・T025は独立して並列可。T027（`page.tsx`への組み込み）はT007, T012（`onValidSubmit`呼び出し口）, T015, T024, T025すべて完了後。T028はT027完了後
- **Polish (Phase 7)**: 全ユーザーストーリー完了後

## Notes

- [P] タスク = 別ファイル・依存関係なし
- 各ユーザーストーリーは独立してテスト可能（[Independent Test] 参照）
- 論理的な単位ごとにコミットする
- MVPスコープ: Phase 3（User Story 1）まで完了すれば、注文フォーム画面への遷移・顧客情報入力欄の表示・空カード時の差し戻しが動作する最小構成となる（User Story 2でバリデーション、User Story 3で注文内容確認、User Story 4で注文確定・永続化を追加）
- 本機能は`004`〜`006`と異なり、初めてバックエンド（`backend/`）・MySQL（`mysql/init/02_orders.sql`）への変更を伴う（[contracts/orders-api.md](./contracts/orders-api.md)）
- 注文完了画面（`/order/complete/[orderNumber]`、REQ-016〜018）自体の実装は本機能のスコープ外であり、別スペックで扱う（[research.md](./research.md) D-07）
