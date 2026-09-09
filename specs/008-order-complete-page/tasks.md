---
description: "Task list for 注文完了画面 (008-order-complete-page)"
---

# Tasks: 注文完了画面

**Input**: Design documents from `/specs/008-order-complete-page/`
**Prerequisites**: [plan.md](./plan.md)（必須）, [spec.md](./spec.md)（必須）, [research.md](./research.md), [data-model.md](./data-model.md), [contracts/get-order-api.md](./contracts/get-order-api.md), [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US3）
- ファイルパスは `plan.md` の Structure Decision（Option 2: frontend/backend 分離。新規テーブル・`docker-compose.yml`変更は不要）に従う

---

## Phase 1: Setup（プロジェクト基盤）

本機能は新規の依存関係・環境変数・ディレクトリ構成の追加を伴わない（`plan.md` Technical Context参照。`docker-compose.yml`の`API_INTERNAL_URL`は`004`〜`005`で設定済み）。Setupタスクはない。

---

## Phase 2: Foundational（共通基盤・全ユーザーストーリーの前提）

**Purpose**: US1〜US3はいずれも同一の注文完了画面上で、同一の`GET /api/orders/:orderNumber`の結果を表示するものであり、この取得経路が整うまでいずれのストーリーも表示できない

### バックエンド

- [x] T001 [P] `backend/src/types/order.ts` に `GetOrderResponse`（`{ orderNumber: string }`）型を追加する（[data-model.md](./data-model.md), [contracts/get-order-api.md](./contracts/get-order-api.md)）
- [x] T002 `backend/src/services/orderService.ts` に `getOrderByNumber(orderNumber: string): Promise<GetOrderResponse | null>` を追加する。`orders`テーブルを`order_number`（プレースホルダ使用、tech-stack.md §8）で検索し、存在すれば`{ orderNumber }`、存在しなければ`null`を返す（T001完了後。[research.md](./research.md) D-01, [data-model.md](./data-model.md)）
- [x] T003 [P] `backend/tests/unit/orderService.test.ts` に `getOrderByNumber` の単体テストを追加する。存在する注文番号では該当データが返ること、存在しない注文番号では`null`が返ることを検証する（T002完了後。憲法§2）
- [x] T004 `backend/src/api/ordersRouter.ts` に `GET /:orderNumber` を追加する。`orderService.getOrderByNumber`を呼び出し、結果が`null`なら404、存在すれば200で`GetOrderResponse`を返す（T002完了後。[contracts/get-order-api.md](./contracts/get-order-api.md)）
- [x] T005 [P] `backend/tests/integration/ordersApi.test.ts` に `GET /api/orders/:orderNumber` の結合テストを追加する。[contracts/get-order-api.md](./contracts/get-order-api.md) の契約テストの観点（実在の注文番号で200・注文番号一致、存在しない注文番号で404、レスポンスに顧客情報等が含まれないこと）を検証する（T004完了後）

### フロントエンド

- [x] T006 [P] `frontend/src/lib/api/orders.ts` に `fetchOrderByNumber(orderNumber: string): Promise<{ orderNumber: string }>` を追加する。サーバーコンポーネントから利用するため`API_INTERNAL_URL`を使用し、レスポンスが`ok`でなければ例外を投げる（`books.ts`の`fetchBookById`と同じパターン。[research.md](./research.md) D-02）

**Checkpoint**: バックエンドAPI（`GET /api/orders/:orderNumber`）とフロントエンドの取得関数が揃い、各ユーザーストーリー（画面表示）の実装に着手できる

---

## Phase 3: User Story 1 - 注文完了メッセージを確認する (Priority: P1) 🎯 MVP

**Goal**: 注文完了画面を新設し、`fetchOrderByNumber`で注文情報を取得できた場合は完了メッセージを表示し、取得できなかった場合は商品一覧画面（`/`）へリダイレクトする（REQ-016, FR-001, FR-002, FR-008）

**Independent Test**: 注文確定後に`/order/complete/<注文番号>`へ遷移し、完了メッセージが表示されることを確認する。存在しない注文番号でアクセスすると`/`へリダイレクトされることも確認する（[quickstart.md](./quickstart.md) 手順1, 5）

- [x] T007 [US1] `frontend/src/app/order/complete/[orderNumber]/page.tsx`（＋`page.module.css`）を新規作成する。サーバーコンポーネントとして`params.orderNumber`を`fetchOrderByNumber`に渡し、取得できた場合は完了メッセージを表示する画面の骨組みを実装する。取得に失敗した場合（例外発生時）は`next/navigation`の`redirect("/")`で商品一覧画面へ差し戻す（T006完了後。FR-001, FR-002, FR-008, [research.md](./research.md) D-02）
- [x] T008 [P] [US1] `frontend/tests/unit/OrderCompletePage.test.tsx` を新規作成する。注文情報の取得に成功した場合に完了メッセージが表示されること、取得に失敗した場合に`redirect("/")`が呼ばれ完了メッセージが表示されないことを検証する単体テストを実装する（T007完了後。憲法§2）

**Checkpoint**: User Story 1 が単独で動作・検証可能（完了メッセージの表示・取得失敗時のリダイレクト）

---

## Phase 4: User Story 2 - 注文番号を確認する (Priority: P1)

**Goal**: 注文完了画面に、確定した注文の注文番号を表示する（REQ-017, FR-003, FR-004, FR-007）

**Independent Test**: 注文完了画面に当該注文の注文番号が表示されることを確認する。ブラウザを再読み込みしても同一の注文番号が再表示されることも確認する（[quickstart.md](./quickstart.md) 手順1, 4）

- [x] T009 [US2] `frontend/src/app/order/complete/[orderNumber]/page.tsx` に、`fetchOrderByNumber`で取得した`orderNumber`を画面上に表示する処理を追加する（T007完了後。FR-003）
- [x] T010 [P] [US2] `frontend/tests/unit/OrderCompletePage.test.tsx` に、取得した注文番号が画面上に表示されることを検証するテストを追加する（T009完了後。FR-003, FR-004, 憲法§2）

**Checkpoint**: User Story 2 が単独で動作・検証可能（注文番号の表示。リロード時の再表示はT007のサーバーコンポーネント構成により自動的に満たされる）

---

## Phase 5: User Story 3 - 商品一覧へ戻る (Priority: P1)

**Goal**: 注文完了画面に商品一覧画面へ戻るリンクを表示する（REQ-018, FR-005）

**Independent Test**: 注文完了画面で「商品一覧へ戻る」リンクをクリックし、商品一覧画面（`/`）へ遷移することを確認する（[quickstart.md](./quickstart.md) 手順2）

- [x] T011 [US3] `frontend/src/app/order/complete/[orderNumber]/page.tsx` に、商品一覧画面（`/`）への`next/link`の`Link`（「商品一覧へ戻る」）を追加する（T007完了後。FR-005）
- [x] T012 [P] [US3] `frontend/tests/unit/OrderCompletePage.test.tsx` に、「商品一覧へ戻る」リンクが表示され`href="/"`であることを検証するテストを追加する（T011完了後。憲法§2）

**Checkpoint**: User Story 3 が単独で動作・検証可能（一覧へ戻る導線）

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 [P] `frontend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T014 [P] `backend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T015 [P] `frontend` / `backend` それぞれの Jest カバレッジが80%以上であることを確認する（憲法§2、tech-stack.md §3）
- [x] T016 [quickstart.md](./quickstart.md) の検証手順（完了メッセージ・注文番号表示、一覧へ戻る、カートクリアの確認、再読み込み時の再表示、存在しない注文番号でのリダイレクト、APIの直接確認）を通しで実行し、結果を確認する

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: タスクなし
- **Foundational (Phase 2)**: Setupの後に着手可能。バックエンド: T001→T002→（T003, T004は並列可）→T004完了後にT005。フロントエンド: T006は他タスクと独立して並列可。US1〜US3のいずれの実装にも先立って完了させる
- **User Story 1 (Phase 3)**: Foundational（特にT006）完了後に着手。T007→T008の順
- **User Story 2 (Phase 4)**: Phase 3のT007（`page.tsx`の骨組み）完了後に着手（同一ファイルを編集するため）。T009→T010の順
- **User Story 3 (Phase 5)**: Phase 3のT007完了後に着手可能（US2と並行実装も可、`page.tsx`内の別要素を追加するため競合時は順にコミット）。T011→T012の順
- **Polish (Phase 6)**: 全ユーザーストーリー完了後

## Notes

- [P] タスク = 別ファイル・依存関係なし
- 各ユーザーストーリーは独立してテスト可能（[Independent Test] 参照）
- 論理的な単位ごとにコミットする
- MVPスコープ: Phase 3（User Story 1）まで完了すれば、注文完了画面への到達・完了メッセージ表示・取得失敗時のリダイレクトが動作する最小構成となる（User Story 2で注文番号表示、User Story 3で一覧へ戻る導線を追加）
- カートのクリア（spec.md FR-006）は`007-order-form-page`で実装済みであり、本機能でのタスクはない（[research.md](./research.md) D-03）
- 新規テーブル・`docker-compose.yml`の変更はない。既存の`orders`テーブル（`007`で追加済み）を参照するのみ
