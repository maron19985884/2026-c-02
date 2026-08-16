---
description: "Task list template for feature implementation"
---

# Tasks: 商品一覧・商品詳細

**Input**: Design documents from `/specs/002-book-catalog-detail/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/books-api.md, quickstart.md

**Tests**: plan.mdでVitest + Supertest + React Testing Libraryの導入を決定済みのため、各ユーザーストーリーに
軽量な契約テスト/コンポーネントテストを含める（厳密なTDDの強制ではなく、憲法セクション2のテスト基準を満たす範囲）。

**Note**: `backend/`・`frontend/`・`mysql/init/`は現時点でディレクトリのみ存在し、`docker-compose.yml`を含め
中身が一切ない状態のため、Phase 1（Setup）でプロジェクトの土台（package.json・Dockerfile・docker-compose.yml等）
から構築する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル・未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- 各タスクは正確なファイルパスを含む

## Path Conventions

Web application構成（plan.md参照）: `backend/src/`, `backend/tests/`, `frontend/src/app/`, `frontend/tests/`, `mysql/init/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの土台構築（docker-compose・各パッケージ初期化・Lint/テスト基盤）

- [x] T001 Create `docker-compose.yml`: frontend(3000番)・backend(4000番)・mysql(3306番)の3サービスを定義し、`mysql/init/`をMySQLコンテナの初期化スクリプトディレクトリとしてマウントする（`requirements.md`制約条件、`plan.md` Target Platform準拠）
- [x] T002 [P] Initialize backend project: `backend/package.json`（express, mysql2, typescript）, `backend/tsconfig.json`, `backend/Dockerfile`, `backend/.dockerignore`
- [x] T003 [P] Initialize frontend project: `frontend/package.json`（next@14, react@18, typescript）, `frontend/tsconfig.json`, `frontend/next.config.js`, `frontend/Dockerfile`, `frontend/.dockerignore`
- [x] T004 [P] Add `vitest`・`supertest`・`@types/supertest`をbackendのdevDependenciesに追加し、`backend/vitest.config.ts`（カバレッジレポーター設定を含む）を作成、`backend/package.json`に`"test": "vitest run"`を追加
- [x] T005 [P] Add `vitest`・`@testing-library/react`・`@testing-library/jest-dom`・`jsdom`をfrontendのdevDependenciesに追加し、`frontend/vitest.config.ts`（`environment: "jsdom"`、カバレッジレポーター設定を含む）を作成、`frontend/package.json`に`"test": "vitest run"`を追加
- [x] T006 [P] Configure ESLint for backend: `backend/.eslintrc`（`docs/tech-stack-template.md`のLint方針準拠）
- [x] T007 [P] Configure ESLint for frontend: `frontend/.eslintrc`
- [x] T008 Create `.env.example`: `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`/`NEXT_PUBLIC_API_URL`を記載（値は仮のプレースホルダーのみ。実際の認証情報はコード・リポジトリに直書きしない。CLAUDE.md禁止事項）

**Checkpoint**: `docker compose up`でコンテナが起動する状態（中身は空のまま）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: US1・US2・US3すべてが依存する共通基盤

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できない

- [x] T009 [P] Create `mysql/init/01_books_seed.sql`: `CREATE TABLE IF NOT EXISTS books`（`id, title, author, price, description, cover_image_url, is_for_sale, created_at`、`data-model.md`/`table-definition.html`参照）と、販売中・非販売を含む数件のサンプル`INSERT`文。破壊的操作（DELETE/DROP/TRUNCATE）は含めない
- [x] T010 [P] Create `backend/src/db/pool.ts`: `mysql2/promise`の`createPool()`を環境変数（`DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`）から生成しexportする
- [x] T011 [P] Create `backend/src/types/book.ts`: `Book`型（`id, title, author, price, description, coverImageUrl`）と一覧用`BookSummary`型（`description`を除く）を定義する
- [x] T012 [P] Create `frontend/src/app/lib/apiClient.ts`: `fetchJson<T>(path): Promise<T | null>`を実装する。404は`null`、5xx・ネットワーク例外・JSON解析失敗は例外をスローする（`basic-design.html`「8. エラー処理方針」・`detail-design.html`の例外処理表準拠）
- [x] T013 Create `backend/src/routes/booksRoutes.ts`の雛形（`express.Router()`、ハンドラは未実装）を作成する
- [x] T014 `backend/src/index.ts`に`app.use("/api/books", booksRouter)`を追加してT013のルーターをマウントする

**Checkpoint**: ここまで完了したら、US1・US2・US3をそれぞれ独立に開始できる

---

## Phase 3: User Story 1 - 販売中の書籍を一覧で確認する (Priority: P1) 🎯 MVP

**Goal**: 商品一覧画面に、販売中の書籍を登録順（新しい書籍が先頭）でグリッド表示し、0件時は空状態を、予期しないエラー時は汎用エラー表示を行う（`detail-design.html`図D5準拠）

**Independent Test**: `mysql/init/01_books_seed.sql`のシードデータで一覧画面(`/`)を開き、書影・タイトル・著者・価格が登録順（新しい順）でグリッド表示されることを確認する。`is_for_sale=0`の書籍が表示されないこと、全件非販売の場合に空状態メッセージが出ることも確認する。

### Tests for User Story 1

- [x] T015 [P] [US1] Contract test for `GET /api/books` in `backend/tests/booksRoutes.test.ts`（Supertest）: 販売中書籍のみ・`created_at DESC, id DESC`順・レスポンス形状（`contracts/books-api.md`準拠）・0件時に`{books: []}`を返すこと・500系（例外発生時）の応答を検証（`detail-design.html`の例外処理表準拠）
- [x] T016 [P] [US1] Component test for `frontend/src/app/components/BookGrid.tsx` in `frontend/tests/BookGrid.test.tsx`（React Testing Library）: 複数書籍を渡した場合のグリッド描画、空配列を渡した場合の空状態メッセージ表示を検証

### Implementation for User Story 1

- [x] T017 [US1] Implement `listForSale(): Promise<BookSummary[]>` in `backend/src/repositories/bookRepository.ts`（`SELECT id, title, author, price, cover_image_url FROM books WHERE is_for_sale = 1 ORDER BY created_at DESC, id DESC`、T010のpoolとT011の型を使用）
- [x] T018 [US1] Implement `GET /` handler in `backend/src/routes/booksRoutes.ts`（T017の`listForSale()`を呼び出し、`{books: [...]}`形式でJSON応答。`try/catch`で例外を捕捉し500を返す。詳細は`detail-design.html`図D1・例外処理表参照）
- [x] T019 [P] [US1] Implement `listBooks(): Promise<BookSummary[]>` in `frontend/src/app/lib/booksApi.ts`（T012の`fetchJson`を使い`GET /api/books`を呼び出す。フロントエンド用`BookSummary`型（camelCase、`contracts/books-api.md`準拠）をここでexportする）
- [x] T020 [P] [US1] Implement `frontend/src/app/components/BookCard.tsx`: 書影（`coverImageUrl`が`null`なら`/images/placeholder-book.svg`）・タイトル・著者・価格を表示し、`next/link`で`/books/{id}`へのリンクにする。画像には書籍タイトルを`alt`属性に設定する（WCAG 2.1 AA、憲法セクション3）
- [x] T021 [US1] Implement `frontend/src/app/components/BookGrid.tsx`: 書籍配列をグリッド表示し、空配列の場合は「現在販売中の書籍はありません」を表示する（FR-008, 項目I-06）
- [x] T022 [US1] Replace `frontend/src/app/page.tsx`（商品一覧画面）: 読み込み中→`listBooks()`呼び出し→例外/0件/通常表示の4状態分岐を実装する（`detail-design.html`図D5準拠）
- [x] T023 [P] [US1] Add placeholder cover image asset at `frontend/public/images/placeholder-book.svg`

**Checkpoint**: この時点で商品一覧画面（US1）は単独で完結し、デモ・検証が可能

---

## Phase 4: User Story 2 - 気になる書籍の詳しい情報を見る (Priority: P2)

**Goal**: 一覧から書籍をクリックして詳細画面に遷移し、説明文を含む詳細情報を確認できる。存在しない/非販売の書籍IDには「見つかりません」状態を、予期しないエラー時は汎用エラー表示を行う（`detail-design.html`図D6準拠）

**Independent Test**: 一覧画面（US1）の書籍をクリックし`/books/{id}`に遷移して書影・タイトル・著者・価格・説明文が表示されることを確認する。存在しないIDや非販売書籍IDに直接アクセスすると「見つかりません」表示と一覧へ戻るリンクが出ることを確認する。

### Tests for User Story 2

- [x] T024 [US2] Contract test for `GET /api/books/:id` in `backend/tests/booksRoutes.test.ts`（存在する書籍IDで詳細が返ること、不正なid形式で400、存在しない/非販売のIDで404 `{error: "book_not_found"}`、例外発生時に500が返ることを検証。T015と同一ファイルに追記するため、T015完了後に着手する）
- [x] T025 [P] [US2] Component test for detail page not-found state in `frontend/tests/BookDetailPage.test.tsx`（React Testing Library）: 存在しないIDに対して「見つかりません」メッセージと一覧へのリンクが表示されることを検証

### Implementation for User Story 2

- [x] T026 [US2] Add `getById(id: number): Promise<Book | null>` to `backend/src/repositories/bookRepository.ts`（`SELECT ... WHERE id = ? AND is_for_sale = 1`、該当なしは`null`を返す。T017と同一ファイルのため、T017完了後に着手する）
- [x] T027 [US2] Implement `GET /:id` handler in `backend/src/routes/booksRoutes.ts`（idが数値でない場合は400、T026の`getById()`を呼び出し見つかれば200、`null`なら404、例外は500。T018と同一ファイルのため、T018完了後に着手する。詳細は`detail-design.html`図D2・例外処理表参照）
- [x] T028 [P] [US2] Implement `getBook(id: number): Promise<Book | null>` in `frontend/src/app/lib/booksApi.ts`（`GET /api/books/:id`を呼び出し、404は`null`として扱う。T019と同一ファイルのため、T019完了後に着手する。フロントエンド用`Book`型をここでexportする）
- [x] T029 [US2] Create `frontend/src/app/books/[id]/page.tsx`: 読み込み中→`getBook()`呼び出し→例外/null(見つかりません)/通常表示の4状態分岐を実装する（`detail-design.html`図D6準拠。書影・タイトル・著者・価格・説明文を表示）。一覧へ戻るリンクは状態に関わらず常時表示する（通常表示時はFR-006、見つかりません時はFR-009に対応）

**Checkpoint**: US1とUS2の両方が独立して動作する（一覧→詳細の遷移を含む）

---

## Phase 5: User Story 3 - カートに追加して他の書籍も見続ける (Priority: P3)

**Goal**: 商品詳細画面から「カートに追加」ができ、追加後も一覧画面に戻って閲覧を継続できる。同一書籍への複数回追加は数量として加算される

**Independent Test**: 詳細画面で「カートに追加」を押し、追加成功が画面上で分かることを確認する。続けて一覧に戻るリンクから一覧画面に戻り、他の書籍を閲覧できることを確認する。同じ書籍を複数回追加した場合、`localStorage`上のカート状態で該当書籍の`quantity`が加算されることを確認する。

### Tests for User Story 3

- [x] T030 [P] [US3] Unit test for `frontend/src/app/lib/cartStore.ts` in `frontend/tests/cartStore.test.ts`: 新規書籍の追加、同一書籍の再追加時に`quantity`が加算されること、`localStorage`書き込み失敗時に例外を投げずフォールバックすることを検証（`detail-design.html`の例外処理表準拠）

### Implementation for User Story 3

- [x] T031 [US3] Implement `frontend/src/app/lib/cartStore.ts`: `addItem(bookId: number): void`と`getItems(): {bookId: number; quantity: number}[]`を実装する（`localStorage`をバックエンドとする。書き込み・読み込み失敗時は`try/catch`で捕捉し、読み込み失敗時は空配列を返す。`data-model.md`「カート追加操作」・`detail-design.html`の例外処理表参照）
- [x] T032 [US3] Implement `frontend/src/app/components/AddToCartButton.tsx`: ネイティブ`<button>`要素を使用しキーボード操作可能にする（WCAG 2.1 AA、憲法セクション3）。クリック時にT031の`addItem()`を呼び出し、追加成功が視覚的に分かる表示を行う。`localStorage`書き込み失敗時は「カートに追加できませんでした」等のフィードバックを表示する
- [x] T033 [US3] Integrate `AddToCartButton.tsx`（T032）を`frontend/src/app/books/[id]/page.tsx`（T029）の詳細表示部分に追加する（T029完了後に着手）

**Checkpoint**: 全ユーザーストーリー（US1・US2・US3）が独立に動作する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる仕上げ作業

- [x] T034 [P] `specs/002-book-catalog-detail/quickstart.md`の手順に沿って一覧・詳細・APIの動作確認を行う
- [x] T035 [P] `npm run build`（型チェック）を`backend/`と`frontend/`の両方で実行し、型エラーがないことを確認する
- [x] T036 [P] `npm run lint`を`backend/`と`frontend/`の両方で実行し、Lintエラー0件を確認する（憲法セクション1、`.github/workflows/quality-gate.yml`対応）
- [x] T037 [P] `vitest run --coverage`を`backend/`と`frontend/`の両方で実行し、カバレッジ80%以上（憲法セクション2の暫定基準、`plan.md` Constitution Check行2）であることを確認する
- [x] T038 [P] 一覧・詳細画面のリンク・ボタンがキーボードのみで操作できることを確認する（WCAG 2.1 AA、憲法セクション3）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。即開始可能
- **Foundational (Phase 2)**: Setup完了後。全ユーザーストーリーをブロックする
- **User Stories (Phase 3-5)**: いずれもFoundational完了後に開始可能
  - US1とUS3は互いに独立
  - US2は「一覧からのクリック遷移」導線としてUS1の`BookCard.tsx`（T020）が生成する`Link`の遷移先を提供するが、
    US2自体の実装（詳細ページ・API）はUS1の実装を待たずに並行して進められる
  - US3（カート追加）はUS2の詳細ページ（T029）にUIとして統合されるため、統合作業（T033）はT029完了後に行う
- **Polish (Phase 6)**: 対象とするユーザーストーリーが完了した後

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後すぐに着手できる。他ストーリーへの依存なし。
- **User Story 2 (P2)**: Foundational完了後すぐに着手できる。ただし下表の4タスクは、US1が新規作成する同じファイルに追記する形になるため、対応するUS1タスクの完了を待ってから着手する必要がある（T025・T029はUS1と無関係に進められる）。

  | US2タスク | 編集するファイル | 待つべきUS1タスク |
  |---|---|---|
  | T024 | `backend/tests/booksRoutes.test.ts` | T015 |
  | T026 | `backend/src/repositories/bookRepository.ts` | T017 |
  | T027 | `backend/src/routes/booksRoutes.ts` | T018 |
  | T028 | `frontend/src/app/lib/booksApi.ts` | T019 |

- **User Story 3 (P3)**: Foundational完了後すぐに着手できる。`cartStore.ts`・`AddToCartButton.tsx`はいずれのストーリーとも編集ファイルが重ならない。ただしUI統合タスク（T033）だけは、統合先である`frontend/src/app/books/[id]/page.tsx`をUS2のT029が作成するため、T029の完了が前提となる。

### Within Each User Story

- テスト（あれば）→ リポジトリ層 → ルート/APIハンドラ → フロントエンドAPI呼び出し → UIコンポーネント → ページ統合

### Parallel Opportunities

- Setup: T002・T003・T004・T005・T006・T007は並行実行可能
- Foundational: T009・T010・T011・T012は並行実行可能（T013はT010完了を待つ必要はないが、ルーター雛形単体のため単独実行）
- Foundational完了後、US1・US2・US3は異なる担当者であれば並行着手可能。ただしUS2のT024/T026/T027/T028は
  US1の対応タスク完了後に着手する必要があり、US3のT033はUS2のT029完了が前提
- US1内: T015・T016（テスト）、T019・T020・T023（別ファイル）は並行実行可能
- US2内: T025は他タスクと並行実行可能
- US3内: T030は他タスクと並行実行可能

---

## Parallel Example: User Story 1

```bash
# US1のテストを並行実行
Task: "Contract test for GET /api/books in backend/tests/booksRoutes.test.ts"
Task: "Component test for BookGrid in frontend/tests/BookGrid.test.tsx"

# US1の独立した実装タスクを並行実行
Task: "Implement listBooks() in frontend/src/app/lib/booksApi.ts"
Task: "Implement BookCard.tsx in frontend/src/app/components/BookCard.tsx"
Task: "Add placeholder cover image asset at frontend/public/images/placeholder-book.svg"
```

---

## Implementation Strategy

### MVP First（User Story 1のみ）

1. Phase 1: Setup を完了する
2. Phase 2: Foundational を完了する（全ストーリーをブロックするため必須）
3. Phase 3: User Story 1 を完了する
4. **STOP and VALIDATE**: 商品一覧画面が単独で正しく動くことを確認する
5. ここまでで「販売中の書籍が分かる」という価値をデモ・検証できる

### Incremental Delivery

1. Setup + Foundational → 基盤完成
2. User Story 1 追加 → 独立検証 → デモ（MVP）
3. User Story 2 追加 → 独立検証（一覧→詳細の遷移も含めて確認）→ デモ
4. User Story 3 追加 → 独立検証（カート追加→一覧復帰）→ デモ
5. 各ストーリーは前のストーリーを壊さずに価値を積み増す

### Parallel Team Strategy

3人程度のチームで並行して進める場合、Setup・Foundational完了後は次のように分担できる。

- 1人目はUser Story 1（一覧）を担当する。`bookRepository.ts`・`booksRoutes.ts`・`booksApi.ts`をこの人が最初に作ることになるため、User Story 2側でこれらのファイルに追記する作業（上表のT024・T026・T027・T028）は、この人の完了を待つ必要がある
- 2人目はUser Story 2を担当する。1人目と別ファイルになるT025（テスト）・T029（詳細ページ）は先に進められるが、T024・T026・T027・T028は1人目の該当タスク完了後に着手する
- 3人目はUser Story 3を担当する。`cartStore.ts`・`AddToCartButton.tsx`はどちらも他の誰の担当ファイルとも重ならないため、Foundational完了後すぐに動ける。ただし最後の統合作業（T033）は、統合先となる2人目のT029（詳細ページ）の完成を待つ

---

## Notes

- [P]タスク = 別ファイル・依存なし
- [Story]ラベルはトレーサビリティのためにユーザーストーリーへタスクを対応付ける
- 各ユーザーストーリーは独立して完了・検証可能であるべき
- 破壊的DB操作（DELETE/DROP/TRUNCATE）を伴うタスクは存在しない（CLAUDE.md禁止事項）
- 論理的なまとまりごと、またはタスクごとにコミットする
- 各チェックポイントでストーリー単独の動作確認を止めて行うこと
