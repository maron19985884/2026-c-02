---
description: "Task list for 商品詳細画面 (005-book-detail-page)"
---

# Tasks: 商品詳細画面

**Input**: Design documents from `/specs/005-book-detail-page/`
**Prerequisites**: [plan.md](./plan.md)（必須）, [spec.md](./spec.md)（必須）, [research.md](./research.md), [data-model.md](./data-model.md), [contracts/books-detail-api.md](./contracts/books-detail-api.md), [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1 / US2 / US3）
- ファイルパスは `plan.md` の Structure Decision（Option 2: frontend/backend 分離、`004-book-list-page` の構成を継続利用）に従う

---

## Phase 1: Setup（プロジェクト基盤）

**Purpose**: 新規プロジェクト初期化

本機能は `004-book-list-page` で構築済みの `backend/` `frontend/` `mysql/` `docker-compose.yml` をそのまま利用する。新規ライブラリ・新規サービスの追加はない（tech-stack.md §6、plan.md Technical Context）。**追加のセットアップタスクはなし。**

---

## Phase 2: Foundational（共通基盤・全ユーザーストーリーの前提）

**Purpose**: 全ユーザーストーリーに先立って必要な共通基盤

`books` テーブルのDBスキーマ、Express起動処理、`ErrorNotice` 共通エラー表示コンポーネント、共通プレースホルダー画像はいずれも `004-book-list-page` で整備済みであり、本機能でそのまま再利用する。**本機能固有の追加基盤タスクはなし。**

---

## Phase 3: User Story 1 - 書籍の詳しい情報を確認する (Priority: P1) 🎯 MVP

**Goal**: 商品詳細画面で書影・タイトル・著者・価格（税込み）・説明文を表示する。取得失敗・存在しないIDの場合は共通エラー表示を出す（REQ-004, FR-001, FR-006〜009）

**Independent Test**: 書籍が1件存在する状態でその書籍の商品詳細画面を開き、5項目が表示されることを確認する。存在しないIDへのアクセス時は共通エラー表示になることも確認する（[quickstart.md](./quickstart.md) 手順1, 2, 5）

- [x] T001 [P] [US1] `backend/src/services/bookService.ts` に `fetchBookById(id)`（`SELECT ... WHERE id = ?`、`description` を含めて返却、該当行なしは `null`）を追加する（[research.md](./research.md) D-01）
- [x] T002 [US1] `backend/tests/unit/bookService.test.ts` に `fetchBookById()` の単体テスト（存在するIDで書籍を返す／存在しないIDで`null`を返す）を追加する（憲法§2）
- [x] T003 [US1] `backend/src/api/booksRouter.ts` に `GET /api/books/:id` を実装する（`bookService.fetchBookById()` を呼び出し、該当なしは`404`、DBエラーは`500`。[contracts/books-detail-api.md](./contracts/books-detail-api.md)）
- [x] T004 [US1] `backend/tests/integration/booksApi.test.ts` に `GET /api/books/:id` の結合テスト（存在するIDで200・存在しないIDで404・DBエラーで500）を追加する（[contracts/books-detail-api.md](./contracts/books-detail-api.md) 契約テストの観点）
- [x] T005 [P] [US1] `frontend/src/lib/api/books.ts` に `fetchBookById(id)`（`GET /api/books/:id` 呼び出し、404/500いずれも例外送出）を追加する（[research.md](./research.md) D-02）
- [x] T006 [US1] `frontend/src/app/books/[id]/page.tsx`（＋`frontend/src/app/books/[id]/page.module.css`）に商品詳細画面を実装する（`fetchBookById()` 呼び出し、成功時は書影[未設定時は共通プレースホルダー]・タイトル・著者・価格・説明文を表示、失敗時[404/500共通]は既存の `ErrorNotice` を表示。FR-001, FR-007, FR-008, FR-009）

**Checkpoint**: User Story 1 が単独で動作・検証可能（詳細情報表示・存在しないID時のエラー表示）

---

## Phase 4: User Story 2 - 書籍をカートに追加する (Priority: P1)

**Goal**: 「カートに追加」ボタン押下のみで書籍を数量1件としてカートに追加でき、既にカートにある場合は数量に1を加算する（上限なし、連打時も1クリックごとに加算）。追加成功はボタン表記の一時変化で伝える（REQ-005, FR-002, FR-003, FR-010, FR-011）

**Independent Test**: 商品詳細画面で「カートに追加」を押し、`localStorage` の `bookstore.cart` に数量1で追加されることを確認する。もう一度押すと数量が2になることも確認する（[quickstart.md](./quickstart.md) 手順3）

- [x] T007 [P] [US2] `frontend/src/types/cart.ts` に `CartItem` 型（`bookId` / `title` / `price` / `imageUrl` / `quantity`）を定義する（[data-model.md](./data-model.md)、`any` 型禁止 tech-stack.md §8）
- [x] T008 [US2] `frontend/src/context/CartContext.tsx` に `CartProvider` / `useCart()` を実装する（初期状態を `localStorage`（キー: `bookstore.cart`）から復元、`addItem(book)` は未登録なら数量1で新規追加、登録済みなら数量+1、上限なし。[research.md](./research.md) D-03, D-04）
- [x] T009 [US2] `frontend/src/app/layout.tsx` を `CartProvider` でラップする（FR-005 の前提となるカート状態の保持先）
- [x] T010 [P] [US2] `frontend/src/components/AddToCartButton.tsx`（＋`AddToCartButton.module.css`）に、クリックで `useCart().addItem()` を呼び出し、ボタン表記を一時的に変化させるコンポーネントを実装する（連打時のデバウンス等は行わず、クリックごとに独立して加算。[research.md](./research.md) D-05）
- [x] T011 [US2] `frontend/src/app/books/[id]/page.tsx` に `AddToCartButton` を組み込む（表示中の書籍情報をpropsとして渡す。FR-002, FR-003）
- [x] T012 [P] [US2] `frontend/tests/unit/CartContext.test.tsx` に、新規追加時は数量1になること・既存書籍への再追加は数量が+1加算されること・複数回追加しても上限なく加算され続けることを検証する単体テストを実装する（憲法§2）
- [x] T013 [P] [US2] `frontend/tests/unit/AddToCartButton.test.tsx` に、クリック時に `addItem` が呼ばれること・ボタン表記が一時的に変化すること・連続クリックのたびに `addItem` が呼ばれること（デバウンスされないこと）を検証するコンポーネントテストを実装する（憲法§2）

**Checkpoint**: User Story 2 が単独で動作・検証可能（カートへの新規追加・数量加算・ボタン表記のフィードバック）

---

## Phase 5: User Story 3 - カートに追加した後も一覧の閲覧を続ける (Priority: P1)

**Goal**: 商品詳細画面から商品一覧画面へ戻る導線を提供し、カートに追加した内容を保持したまま一覧の閲覧を続けられるようにする（REQ-006, FR-004, FR-005）

**Independent Test**: 商品詳細画面でカートに追加した後、「一覧へ戻る」導線から一覧画面に戻り、別の書籍を追加してもカート内容が失われないことを確認する（[quickstart.md](./quickstart.md) 手順4）

- [x] T014 [US3] `frontend/src/app/books/[id]/page.tsx` に商品一覧画面へ戻る導線（Next.js `Link` → `/`）を追加する（FR-004）
- [x] T015 [US3] `frontend/tests/unit/CartContext.test.tsx` に、`localStorage` へ保存された内容が再マウント時にも復元され、追加済みのカート内容が失われないことを検証するテストを追加する（FR-005、憲法§2）

**Checkpoint**: User Story 3 が単独で動作・検証可能（一覧へ戻る導線・カート内容の保持）

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 [P] `frontend` / `backend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T017 [P] `frontend` / `backend` の Jest カバレッジが80%以上であることを確認する（憲法§2、tech-stack.md §3）
- [x] T018 [quickstart.md](./quickstart.md) の検証手順（起動・詳細表示・カート追加・一覧へ戻る・エラー表示）を通しで実行し、結果を確認する

---

## Dependencies & Execution Order

- **Setup (Phase 1)** / **Foundational (Phase 2)**: 追加タスクなし。`004-book-list-page` の成果物をそのまま前提とする
- **User Story 1 (Phase 3)**: T001→T002→T003→T004（backend縦の依存）。T005（frontend api client）はT001〜T004と並列可。T006（page.tsx）はT003（API実装）・T005（frontend api client）の完了後に着手
- **User Story 2 (Phase 4)**: Phase 3 の T006（`page.tsx` の存在）完了後に着手可能。T007→T008→T009（Context基盤の縦の依存）。T010（`AddToCartButton`）はT007〜T009と並列可。T011（page.tsxへの組み込み）はT006・T008・T010の完了後。T012・T013はそれぞれ対応する実装（T008・T010）完了後、互いに並列可
- **User Story 3 (Phase 5)**: Phase 4 の T006/T011（`page.tsx`）・T008（`CartContext`）完了後に着手。T014とT015は独立ファイルのため並列可
- **Polish (Phase 6)**: 全ユーザーストーリー完了後

## Notes

- [P] タスク = 別ファイル・依存関係なし
- 各ユーザーストーリーは独立してテスト可能（[Independent Test] 参照）
- 論理的な単位ごとにコミットする
- MVPスコープ: Phase 3（User Story 1）まで完了すれば、商品詳細情報の表示とエラー表示が動作する最小構成となる（User Story 2 でカート追加、User Story 3 で一覧へ戻る導線とカート保持を追加）
