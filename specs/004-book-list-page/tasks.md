---
description: "Task list for 商品一覧画面 (004-book-list-page)"
---

# Tasks: 商品一覧画面

**Input**: Design documents from `/specs/004-book-list-page/`
**Prerequisites**: [plan.md](./plan.md)（必須）, [spec.md](./spec.md)（必須）, [research.md](./research.md), [data-model.md](./data-model.md), [contracts/books-api.md](./contracts/books-api.md), [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1 / US2 / US3）
- ファイルパスは `plan.md` の Structure Decision（Option 2: frontend/backend 分離）に従う

---

## Phase 1: Setup（プロジェクト基盤）

**Purpose**: `plan.md` の Project Structure に基づき、まだ存在しない `frontend/` `backend/` `mysql/` `docker-compose.yml` を新規作成する

- [x] T001 リポジトリ直下に `docker-compose.yml` を作成し、`frontend`（:3000）/ `backend`（:4000）/ `mysql`（:3306）の3サービスを定義する（tech-stack.md §1, §5 `.env` 経由での接続情報注入）
- [x] T002 `backend/package.json`・`backend/tsconfig.json`・`backend/Dockerfile` を作成する（Node.js 20 / Express 4.18 / TypeScript 5.x / `mysql2` / `cors`。tech-stack.md §2）
- [x] T003 [P] `frontend/package.json`・`frontend/tsconfig.json`・`frontend/Dockerfile` を作成する（Next.js 14.2.3 / React 18 / TypeScript 5.x。tech-stack.md §2）
- [x] T004 [P] `backend/.eslintrc.json` を作成する（`@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` recommended。tech-stack.md §3）
- [x] T005 [P] `frontend/.eslintrc.json` を作成する（`eslint-config-next` = `next/core-web-vitals`。tech-stack.md §3）
- [x] T006 [P] `backend` に Jest（`ts-jest` + `supertest`）を設定する（`backend/jest.config.js`、`coverageThreshold` 80%。tech-stack.md §3）
- [x] T007 [P] `frontend` に Jest（`next/jest` + `jest-environment-jsdom` + `@testing-library/react` + `@testing-library/jest-dom`）を設定する（`frontend/jest.config.js`、`coverageThreshold` 80%。tech-stack.md §3）

**Checkpoint**: `docker compose up` でコンテナが起動する状態（アプリロジックはまだ空）

---

## Phase 2: Foundational（共通基盤・全ユーザーストーリーの前提）

**Purpose**: どのユーザーストーリーの実装にも先立って必要な、DBスキーマ・型定義・共通コンポーネント・アプリ起動処理

- [x] T008 `mysql/init/01_init.sql` に `books` テーブル定義（`id` / `title` / `author` / `price` / `description` / `image_url` / `created_at`）と初期データ（デモ用書籍数件、書影ありなし混在）を作成する（[data-model.md](./data-model.md), [research.md](./research.md) D-04）
- [x] T009 [P] `frontend/src/types/book.ts` に `Book` / `BookListItem` 型を定義する（[data-model.md](./data-model.md)、`any` 型禁止 tech-stack.md §8）
- [x] T010 [P] `backend/src/db/pool.ts` に `mysql2` コネクションプールを実装する（接続情報は環境変数経由、直書き禁止 tech-stack.md §8）
- [x] T011 `backend/src/index.ts` に Express アプリ起動処理（`cors` 設定、ルーター登録）を実装する
- [x] T012 [P] `frontend/src/components/ErrorNotice.tsx` に共通エラー表示コンポーネントを実装する（憲法§3, [research.md](./research.md) D-03）
- [x] T013 [P] `frontend/src/components/EmptyState.tsx` に共通空状態表示コンポーネントを実装する（憲法§3, [research.md](./research.md) D-03）
- [x] T014 [P] `frontend/public/images/book-placeholder.png` に共通プレースホルダー画像を配置する（FR-008, [research.md](./research.md) D-02）

**Checkpoint**: DBスキーマ・型・共通コンポーネント・サーバー起動が揃い、ユーザーストーリーの実装に着手できる

---

## Phase 3: User Story 1 - 販売中の書籍をまとめて見る (Priority: P1) 🎯 MVP

**Goal**: 販売中の書籍をグリッド形式で一覧表示し、0件時は空状態、取得失敗時はエラー表示を出す（REQ-001, FR-001, FR-004, FR-006, FR-007, FR-009）

**Independent Test**: `books` テーブルに複数件登録した状態で一覧画面を開き、グリッド表示されることを確認する。0件時・API失敗時もそれぞれ確認する（[quickstart.md](./quickstart.md) 手順2, 4, 5）

- [x] T015 [P] [US1] `backend/src/services/bookService.ts` に `fetchBooks()`（`SELECT ... ORDER BY id ASC`、全件取得）を実装する（FR-006, FR-009, [research.md](./research.md) D-01）
- [x] T016 [US1] `backend/tests/unit/bookService.test.ts` に `fetchBooks()` がID昇順で返すことを検証する単体テストを実装する（憲法§2）
- [x] T017 [US1] `backend/src/api/booksRouter.ts` に `GET /api/books` を実装する（`bookService.fetchBooks()` を呼び出し、0件時は `200 []`、DBエラー時は `500`。[contracts/books-api.md](./contracts/books-api.md)）
- [x] T018 [US1] `backend/tests/integration/booksApi.test.ts` に `supertest` を用いた結合テスト（複数件時のID昇順・0件時の`200 []`・DBエラー時の`500`）を実装する（[contracts/books-api.md](./contracts/books-api.md) 契約テストの観点）
- [x] T019 [P] [US1] `frontend/src/lib/api/books.ts` に `fetchBooks()`（`GET /api/books` 呼び出し、失敗時は例外送出）を実装する（[research.md](./research.md) D-05, FR-007）
- [x] T020 [US1] `frontend/src/components/BookGrid.tsx` に一覧グリッド表示を実装する（書籍0件時は `EmptyState` を表示。FR-001, FR-004）
- [x] T021 [US1] `frontend/src/app/page.tsx`（＋`frontend/src/app/page.module.css`）に商品一覧画面を実装する（`fetchBooks()` 呼び出し、成功時は `BookGrid`、失敗時は `ErrorNotice`。FR-007）
- [x] T022 [P] [US1] `frontend/tests/unit/BookGrid.test.tsx` に、複数件表示・0件時の空状態表示を検証するコンポーネントテストを実装する（憲法§2）

**Checkpoint**: User Story 1 が単独で動作・検証可能（一覧のグリッド表示・空状態・エラー表示）

---

## Phase 4: User Story 2 - 一覧上で書籍の基本情報を確認する (Priority: P1)

**Goal**: 各書籍カードに書影（またはプレースホルダー）・タイトル・著者・価格を表示する（REQ-002, FR-002, FR-008）

**Independent Test**: 一覧画面の各書籍カードに4項目が表示され、書影未設定の書籍はプレースホルダー画像になることを確認する（[quickstart.md](./quickstart.md) 手順2）

- [x] T023 [P] [US2] `frontend/src/components/BookCard.tsx` に書影・タイトル・著者・価格を表示するカードを実装する（`imageUrl` が null/空文字の場合は共通プレースホルダー画像にフォールバック。FR-002, FR-008）
- [x] T024 [US2] `frontend/src/components/BookGrid.tsx` から `BookCard` を呼び出すように接続する
- [x] T025 [P] [US2] `frontend/tests/unit/BookCard.test.tsx` に、4項目の表示およびプレースホルダーへのフォールバックを検証するコンポーネントテストを実装する（憲法§2）

**Checkpoint**: User Story 2 が単独で動作・検証可能（各カードの情報表示）。User Story 1 のグリッドに統合済み

---

## Phase 5: User Story 3 - 一覧から詳細画面へ遷移する (Priority: P1)

**Goal**: 書籍カードをクリックすると、その書籍に対応する商品詳細画面へ遷移する（REQ-003, FR-003）

**Independent Test**: 一覧の異なる書籍カードをそれぞれクリックし、クリックした書籍に対応する詳細画面パスへ遷移することを確認する（商品詳細画面自体の実装は別機能のスコープ。[quickstart.md](./quickstart.md) 手順3）

- [x] T026 [US3] `frontend/src/components/BookCard.tsx` にクリック時のナビゲーション（Next.js `Link`、遷移先 `/books/[id]`）を実装する（FR-003）
- [x] T027 [US3] `frontend/tests/unit/BookCard.test.tsx` に、クリックした書籍IDに対応する遷移先が生成されることを検証するテストを追加する（憲法§2）

**Checkpoint**: User Story 3 が単独で動作・検証可能（各カードが正しい詳細画面パスへ遷移する）

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T028 [P] `frontend` / `backend` の ESLint を実行し、エラー0件にする（憲法§1）
- [x] T029 [P] `frontend` / `backend` の Jest カバレッジが80%以上であることを確認する（憲法§2、tech-stack.md §3）
- [x] T030 [quickstart.md](./quickstart.md) の検証手順（起動・一覧表示・詳細遷移・空状態・エラー表示）を通しで実行し、結果を確認する

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: 依存なし。T001〜T007は基本的に並列可（T002/T003はディレクトリが独立、T004〜T007はさらに独立）
- **Foundational (Phase 2)**: Phase 1 完了後に着手。T008（DBスキーマ）・T010〜T011（backend起動系）・T009, T012〜T014（frontend型/共通コンポーネント）は互いに並列可。**全ユーザーストーリーをブロックする**
- **User Story 1 (Phase 3)**: Phase 2 完了後に着手可能。T015→T016→T017→T018（backend縦の依存）、T019→T020→T021→T022（frontend縦の依存）。backend系とfrontend系は並列可
- **User Story 2 (Phase 4)**: Phase 3 の `BookGrid`（T020）完了後に着手（`BookGrid` へ `BookCard` を接続するため）
- **User Story 3 (Phase 5)**: Phase 4 の `BookCard`（T023）完了後に着手（同一ファイルへの追加のため）
- **Polish (Phase 6)**: 全ユーザーストーリー完了後

## Notes

- [P] タスク = 別ファイル・依存関係なし
- 各ユーザーストーリーは独立してテスト可能（[Independent Test] 参照）
- 論理的な単位ごとにコミットする
- MVPスコープ: Phase 1〜3（User Story 1）まで完了すれば、一覧のグリッド表示・空状態・エラー表示が動作する最小構成となる（User Story 2, 3 でカード情報・遷移を追加）
