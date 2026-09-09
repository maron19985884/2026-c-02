---
description: "Task list for カート画面 (006-cart-page)"
---

# Tasks: カート画面

**Input**: Design documents from `/specs/006-cart-page/`
**Prerequisites**: [plan.md](./plan.md)（必須）, [spec.md](./spec.md)（必須）, [research.md](./research.md), [data-model.md](./data-model.md), [contracts/no-new-api.md](./contracts/no-new-api.md)（新規APIなし）, [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US5）
- ファイルパスは `plan.md` の Structure Decision（Option 2: frontend/backend 分離。本機能はfrontendのみ変更）に従う

---

## Phase 1: Setup（プロジェクト基盤）

**Purpose**: 新規プロジェクト初期化

本機能は `004-book-list-page` / `005-book-detail-page` で構築済みの `frontend/` `backend/` `mysql/` `docker-compose.yml` をそのまま利用する。新規ライブラリ・新規サービスの追加はない（tech-stack.md §6、plan.md Technical Context）。**追加のセットアップタスクはなし。**

---

## Phase 2: Foundational（共通基盤・全ユーザーストーリーの前提）

**Purpose**: 全ユーザーストーリーに先立って必要な共通基盤

`CartItem` 型（`frontend/src/types/cart.ts`）、`CartContext` / `useCart()` の基本実装（`items` と `addItem`）、`EmptyState` 共通コンポーネントはいずれも `004-book-list-page` / `005-book-detail-page` で整備済みであり、本機能でそのまま再利用する。**本機能固有の追加基盤タスクはなし**（`increaseQuantity` / `decreaseQuantity` / `removeItem` / `calcCartTotal` はそれぞれ専用のユーザーストーリーでのみ必要となるため、各Phaseに配置する）。

---

## Phase 3: User Story 1 - カートの内容を確認する (Priority: P1) 🎯 MVP

**Goal**: カート画面にカート内の各書籍の書名・単価・数量・小計を一覧表示する。カートが空の場合は空状態メッセージを表示する（REQ-007, FR-001, FR-002）

**Independent Test**: カートに書籍が1件以上入っている状態でカート画面を開き、各行に書名・単価・数量・小計が表示されることを確認する。カートが空の場合は空状態メッセージが表示されることも確認する（[quickstart.md](./quickstart.md) 手順1, 2）

- [x] T001 [US1] `frontend/src/app/cart/page.tsx`（＋`frontend/src/app/cart/page.module.css`）を新規作成する。`useCart()` から `items` を取得し、`items.length === 0` なら空状態、それ以外なら `CartItemRow` を1行ずつ表示する骨組みを実装する（FR-001）
- [x] T002 [P] [US1] `frontend/src/components/CartItemRow.tsx`（＋`CartItemRow.module.css`）を新規作成する。書名・単価（¥表記）・数量（表示のみ）・小計（`price * quantity`）を表示する行コンポーネントを実装する（FR-001。数量の増減・削除ボタンは後続フェーズで追加）
- [x] T003 [US1] `frontend/src/app/cart/page.tsx` に `items.length === 0` の場合の分岐を実装し、既存の `EmptyState` コンポーネントで空状態メッセージと商品一覧へ戻る `Link href="/"` を表示する（FR-002, [research.md](./research.md) D-03）
- [x] T004 [P] [US1] `frontend/tests/unit/CartItemRow.test.tsx` を新規作成する。書名・単価・数量・小計（単価×数量）が正しく表示されることを検証する単体テストを実装する（憲法§2）
- [x] T005 [US1] `frontend/tests/unit/CartPage.test.tsx` を新規作成する。`items` が0件のとき `EmptyState` が表示されること、1件以上のとき件数分の `CartItemRow` が表示されることを検証するテストを実装する（FR-001, FR-002, 憲法§2）

**Checkpoint**: User Story 1 が単独で動作・検証可能（カート内容の一覧表示・空状態表示）

---

## Phase 4: User Story 2 - カート内の数量を変更する (Priority: P1)

**Goal**: 各書籍の数量を+/-ボタンで増減でき、小計・合計が即時更新される。数量1のときは減少ボタンを無効化し1未満にならない（REQ-008, FR-003, FR-004, FR-005）

**Independent Test**: カートに書籍が1件入っている状態で数量の増加・減少ボタンを操作し、当該行の小計が即座に再計算されることを確認する。数量1で減少ボタンが無効化されていることも確認する（[quickstart.md](./quickstart.md) 手順3）

- [x] T006 [US2] `frontend/src/context/CartContext.tsx` に `increaseQuantity(bookId)`（対象行の `quantity` を+1、上限なし）と `decreaseQuantity(bookId)`（`quantity` が2以上のときのみ-1、1のときは変化なし）を追加する（[research.md](./research.md) D-01, FR-005）
- [x] T007 [P] [US2] `frontend/tests/unit/CartContext.test.tsx` に `increaseQuantity` / `decreaseQuantity` の単体テストを追加する（上限なく加算されること、数量1のとき `decreaseQuantity` を呼んでも1のままであることを検証。憲法§2）
- [x] T008 [US2] `frontend/src/components/CartItemRow.tsx` に数量の+/-ボタンを追加し、`onClick` で `useCart().increaseQuantity` / `decreaseQuantity` を呼び出す。数量が1のとき減少ボタンを `disabled` にする（FR-003, FR-005）
- [x] T009 [US2] `frontend/tests/unit/CartItemRow.test.tsx` に、+ボタン押下で `increaseQuantity` が呼ばれること、数量1のとき-ボタンが `disabled` であること、数量2以上のとき-ボタン押下で `decreaseQuantity` が呼ばれることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 2 が単独で動作・検証可能（数量増減・下限ガード）

---

## Phase 5: User Story 3 - カートから書籍を削除する (Priority: P1)

**Goal**: 各書籍をカートから削除でき、削除後に当該行が消え合計金額が更新される（REQ-009, FR-006, FR-007）

**Independent Test**: カートに書籍が2件入っている状態で1件を削除し、その行が一覧から消えることを確認する（[quickstart.md](./quickstart.md) 手順4）

- [x] T010 [US3] `frontend/src/context/CartContext.tsx` に `removeItem(bookId)`（該当 `bookId` の項目を配列から除去）を追加する（[research.md](./research.md) D-01, FR-006）
- [x] T011 [P] [US3] `frontend/tests/unit/CartContext.test.tsx` に `removeItem` の単体テストを追加する（該当項目が除去され、他の項目には影響しないことを検証。憲法§2）
- [x] T012 [US3] `frontend/src/components/CartItemRow.tsx` に削除ボタンを追加し、`onClick` で `useCart().removeItem(bookId)` を呼び出す（FR-006）
- [x] T013 [US3] `frontend/tests/unit/CartItemRow.test.tsx` に、削除ボタン押下で `removeItem` が呼ばれることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 3 が単独で動作・検証可能（削除操作）

---

## Phase 6: User Story 4 - カート全体の合計金額を確認する (Priority: P1)

**Goal**: カート内全書籍の小計の総和を合計金額として常に表示し、数量変更・削除のたびに再計算する（REQ-010, FR-008）

**Independent Test**: カートに単価の異なる書籍が複数件入っている状態でカート画面を開き、表示される合計金額が各行の小計の総和と一致することを確認する（[quickstart.md](./quickstart.md) 手順5）

- [x] T014 [P] [US4] `frontend/src/lib/calcCartTotal.ts` を新規作成する。`CartItem[]` から `price * quantity` の総和を返す純粋関数 `calcCartTotal(items)` を実装する（[research.md](./research.md) D-02, FR-008）
- [x] T015 [P] [US4] `frontend/tests/unit/calcCartTotal.test.ts` を新規作成する。空配列で0を返すこと、複数件で正しい総和を返すことを検証する単体テストを実装する（憲法§2, SC-004）
- [x] T016 [US4] `frontend/src/app/cart/page.tsx` に `calcCartTotal(items)` を呼び出し、合計金額を画面下部に常時表示する処理を追加する（FR-008）
- [x] T017 [US4] `frontend/tests/unit/CartPage.test.tsx` に、表示される合計金額が各行小計の総和と一致することを検証するテストを追加する（SC-004, 憲法§2）

**Checkpoint**: User Story 4 が単独で動作・検証可能（合計金額の表示・再計算）

---

## Phase 7: User Story 5 - 注文手続きへ進む (Priority: P1)

**Goal**: カートに1件以上ある場合のみ「注文手続きへ」ボタンを表示し、押下で注文フォーム画面（`/order`）へ遷移する。カートが空の場合はボタンを表示しない（REQ-011, FR-009, FR-010）

**Independent Test**: カートに書籍が1件以上入っている状態で「注文手続きへ」ボタンを押し、`/order` へ遷移することを確認する。カートが空の場合はボタンが表示されないことも確認する（[quickstart.md](./quickstart.md) 手順6）

- [x] T018 [US5] `frontend/src/app/cart/page.tsx` に、`items.length > 0` の場合のみ「注文手続きへ」ボタン（`Link href="/order"`）を表示する分岐を追加する（FR-009, [research.md](./research.md) D-04）
- [x] T019 [US5] `frontend/src/app/cart/page.tsx` の空状態分岐（T003）で「注文手続きへ」ボタンを表示しないことを確認し、商品一覧へ戻る `Link` のみが表示される状態を維持する（FR-010）
- [x] T020 [US5] `frontend/tests/unit/CartPage.test.tsx` に、`items` が0件のとき「注文手続きへ」ボタンが表示されないこと、1件以上のとき表示され `/order` への `Link` であることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 5 が単独で動作・検証可能（注文手続き導線の表示条件・遷移）

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T021 [P] `frontend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T022 [P] `frontend` の Jest カバレッジが80%以上であることを確認する（憲法§2、tech-stack.md §3）
- [x] T023 [quickstart.md](./quickstart.md) の検証手順（表示・空状態・数量増減・削除・合計金額・注文手続きへの遷移）を通しで実行し、結果を確認する

---

## Dependencies & Execution Order

- **Setup (Phase 1)** / **Foundational (Phase 2)**: 追加タスクなし。`004-book-list-page` / `005-book-detail-page` の成果物をそのまま前提とする
- **User Story 1 (Phase 3)**: T001→T003（`page.tsx` の縦の依存）。T002（`CartItemRow`）はT001と並列可。T004（`CartItemRow` テスト）はT002完了後。T005（`CartPage` テスト）はT001・T003完了後
- **User Story 2 (Phase 4)**: Phase 3 完了後に着手。T006（`CartContext` 拡張）→T008（`CartItemRow` へのボタン追加）の順（T008はT002・T006完了後）。T007（`CartContext` テスト）はT006完了後、T009（`CartItemRow` テスト）はT008完了後、それぞれ独立して並列可
- **User Story 3 (Phase 5)**: Phase 4 完了後に着手（同一ファイル `CartItemRow.tsx` / `CartContext.tsx` を編集するため）。T010→T012の順（T012はT002/T008・T010完了後）。T011・T013はそれぞれ対応する実装（T010・T012）完了後
- **User Story 4 (Phase 6)**: Phase 3 の T001（`page.tsx` の存在）完了後に着手可能（US2/US3と並行実装も可）。T014（`calcCartTotal`）とT015（そのテスト）は他ユーザーストーリーと独立して並列可。T016（`page.tsx` への組み込み）はT001・T014完了後。T017はT016完了後
- **User Story 5 (Phase 7)**: Phase 3 の T001/T003（`page.tsx` の一覧表示・空状態分岐）完了後に着手可能。T018→T019→T020の順
- **Polish (Phase 8)**: 全ユーザーストーリー完了後

## Notes

- [P] タスク = 別ファイル・依存関係なし
- 各ユーザーストーリーは独立してテスト可能（[Independent Test] 参照）
- 論理的な単位ごとにコミットする
- MVPスコープ: Phase 3（User Story 1）まで完了すれば、カート内容の一覧表示と空状態表示が動作する最小構成となる（User Story 2で数量増減、User Story 3で削除、User Story 4で合計金額、User Story 5で注文手続きへの導線を追加）
- 本機能はバックエンド（`backend/`）・MySQLへの変更を含まない（[contracts/no-new-api.md](./contracts/no-new-api.md)）
