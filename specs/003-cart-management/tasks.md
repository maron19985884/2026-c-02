---
description: "Task list template for feature implementation"
---

# Tasks: カート画面

**Input**: Design documents from `/specs/003-cart-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/no-new-api.md, quickstart.md

**Tests**: 002-book-catalog-detailで導入済みのVitest + React Testing Library + Playwrightを継続利用する
（憲法セクション2のテスト基準を満たす範囲）。本機能はバックエンド変更がないためSupertestの対象はない。

**Note**: 本機能はバックエンドAPI・DBスキーマの追加・変更を行わない（`contracts/no-new-api.md`参照）。
新規に触るのはfrontend側5ファイル（新規2・修正3）のみ。プロジェクトの土台（package.json・
docker-compose.yml等）は002で構築済みのため、Setupフェーズの作業は発生しない。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル・未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3, US4）
- 各タスクは正確なファイルパスを含む

## Path Conventions

`frontend/src/app/`, `frontend/tests/`, `e2e/tests/`（002-book-catalog-detailの構成を継続）

---

## Phase 1: Setup

**Purpose**: プロジェクト初期化。本機能では新規依存パッケージ・スキャフォールディングが不要なため対象タスクなし。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: US2・US3が依存するcartStoreの拡張

**⚠️ CRITICAL**: このフェーズが完了するまでUS2・US3の実装は開始できない（US1・US4は本フェーズに依存しない）

- [x] T001 Add `updateQuantity(bookId: number, quantity: number): boolean` to `frontend/src/app/lib/cartStore.ts`（該当項目の数量を更新し`localStorage`に保存。`quantity`が1未満の場合は更新せず`false`を返す（FR-009）。`addItem`と同様に書き込み失敗時も`try/catch`で捕捉し`false`を返す）
- [x] T002 Add `removeItem(bookId: number): boolean` to `frontend/src/app/lib/cartStore.ts`（該当項目を配列から除いて`localStorage`に保存し、成否を`boolean`で返す。T001と同一ファイルのため、T001完了後に着手する）

**Checkpoint**: ここまで完了したら、US1・US2・US3・US4をそれぞれ着手できる（US2はT001、US3はT002が前提）

---

## Phase 3: User Story 1 - カートに入れた書籍を一覧で確認する (Priority: P1) 🎯 MVP

**Goal**: カート画面に、書名・単価・数量・小計・合計を表示する。カートが空の場合は空状態を、販売対象外になった書籍がある場合はその旨を表示する。一覧・詳細画面からカートへの導線を設ける（FR-012）

**Independent Test**: カートに複数件の書籍が入っている状態で`/cart`を開き、各行の書名・単価・数量・小計と合計が表示されることを確認する。カートを空にした状態でも空状態メッセージが表示されることを確認する。商品一覧・詳細画面からカートへのリンクをたどれることを確認する。

### Tests for User Story 1

- [x] T003 [P] [US1] Component test for `frontend/src/app/cart/page.tsx` in `frontend/tests/CartPage.test.tsx`（React Testing Library）: 複数項目の表示、合計金額の算出、空状態、販売対象外書籍（`GET /api/books`結果に含まれないbookId）の表示を検証（`booksApi.listBooks`と`cartStore.getItems`をモック）

### Implementation for User Story 1

- [x] T004 [US1] Create `frontend/src/app/components/CartItemRow.tsx`: 書影・書名・単価・数量・小計を表示する行コンポーネント（この時点では数量操作・削除ボタンは表示のみで機能なし。販売対象外の場合はその旨を表示する）
- [x] T005 [US1] Create `frontend/src/app/cart/page.tsx`: `booksApi.listBooks()`と`cartStore.getItems()`を突き合わせてカート項目（title/price/subtotal/isAvailable、data-model.md参照）と合計を算出し、`CartItemRow`（T004）で一覧表示する。カートが空の場合は空状態を表示する（FR-008）。T004完了後に着手する
- [x] T006 [P] [US1] Modify `frontend/src/app/layout.tsx`: ヘッダーに「カート」リンクを追加する（FR-012、`/cart`へのnext/linkリンク。T004・T005とは別ファイルのため並行実行可能）

**Checkpoint**: この時点でカート画面の閲覧（US1）は単独で完結し、デモ・検証が可能

---

## Phase 4: User Story 2 - 数量を変更する (Priority: P2)

**Goal**: カート画面で書籍の数量を増減でき、小計・合計が画面を再読み込みせずに更新される。数量は1未満にできない

**Independent Test**: カート画面である書籍の数量を「+」で増やし、その行の小計と全体の合計が更新されることを確認する。「−」で数量1の項目をこれ以上減らせないことを確認する。

### Tests for User Story 2

- [x] T007 [P] [US2] Unit test for `updateQuantity()` in `frontend/tests/cartStore.test.ts`（追記）: 数量増減、1未満にはならないことを検証

### Implementation for User Story 2

- [x] T008 [US2] `frontend/src/app/components/CartItemRow.tsx`に数量「+」「−」ボタンを追加し、クリック時に`updateQuantity()`（T001）を呼び出す。数量が1のとき「−」ボタンを無効化する（FR-009）。T004と同一ファイルのため、T004完了後に着手する
- [x] T009 [US2] `frontend/src/app/cart/page.tsx`で、数量変更後に一覧・小計・合計が再計算されて表示されるよう状態管理を実装する（T005と同一ファイルのため、T005完了後に着手する）

**Checkpoint**: US1とUS2が独立して動作する（一覧表示＋数量変更）

---

## Phase 5: User Story 3 - 不要な書籍をカートから削除する (Priority: P2)

**Goal**: カート画面で書籍を削除でき、合計が画面を再読み込みせずに更新される

**Independent Test**: カート画面である書籍を削除し、その行が消えて合計が更新されることを確認する。最後の1件を削除するとカートが空状態になることを確認する。

### Tests for User Story 3

- [x] T010 [P] [US3] Unit test for `removeItem()` in `frontend/tests/cartStore.test.ts`（追記）: 削除後に該当項目が配列から消えることを検証

### Implementation for User Story 3

- [x] T011 [US3] `frontend/src/app/components/CartItemRow.tsx`に削除ボタンを追加し、クリック時に`removeItem()`（T002）を呼び出す。T004・T008と同一ファイルのため、T008完了後に着手する
- [x] T012 [US3] `frontend/src/app/cart/page.tsx`で、削除後に一覧・合計が再計算され、全件削除時は空状態に切り替わるよう状態管理を実装する。T005・T009と同一ファイルのため、T009完了後に着手する

**Checkpoint**: US1・US2・US3が独立して動作する（一覧表示＋数量変更＋削除）

---

## Phase 6: User Story 4 - 注文手続きに進む (Priority: P3)

**Goal**: カートに書籍がある場合のみ「注文手続きへ」ボタンから次の画面へ遷移できる

**Independent Test**: カートに書籍がある状態で「注文手続きへ」を押すと遷移することを確認する。カートが空の状態ではボタンが無効化されていることを確認する。

### Tests for User Story 4

- [x] T013 [P] [US4] Component test for the checkout button in `frontend/tests/CartPage.test.tsx`（追記）: カートに項目がある場合は有効、空の場合は無効であることを検証

### Implementation for User Story 4

- [x] T014 [US4] `frontend/src/app/cart/page.tsx`に「注文手続きへ」ボタン（`/order`へのリンク）を追加する。カートが空の場合は無効化する（FR-011）。T005・T009・T012と同一ファイルのため、T012完了後に着手する。遷移先の`/order`画面自体は次feature（004）で作成するため、本タスクの時点では未実装（リンク切れの状態になる）

**Checkpoint**: 全ユーザーストーリー（US1〜US4）が独立に動作する

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる仕上げ作業

- [x] T015 [P] Create `e2e/tests/cart.spec.ts`: `quickstart.md`の動作確認シナリオ（1〜9）をPlaywrightで自動化する
- [x] T016 [P] `npm run build`（型チェック）を`frontend/`で実行し、型エラーがないことを確認する
- [x] T017 [P] `npm run lint`を`frontend/`で実行し、Lintエラー0件を確認する
- [x] T018 [P] `vitest run --coverage`を`frontend/`で実行し、カバレッジ80%以上（憲法セクション2）を確認する
- [x] T019 [P] カート画面のリンク・ボタン（数量操作・削除・注文手続きへ）がキーボード操作のみで実行できることを確認する（WCAG 2.1 AA、憲法セクション3）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 対象タスクなし
- **Foundational (Phase 2)**: 依存なし、即開始可能。US2はT001、US3はT002の完了が前提
- **User Stories (Phase 3-6)**: US1・US4はFoundational非依存で即開始可能。US2・US3はFoundational完了後に開始可能
- **Polish (Phase 7)**: 対象とするユーザーストーリーが完了した後

### User Story Dependencies

- **User Story 1 (P1)**: 依存なし。即開始可能
- **User Story 2 (P2)**: T001（Foundational）が前提。加えて下表の2タスクは、US1が新規作成する同じファイルに追記する形になるため、対応するUS1タスクの完了を待ってから着手する必要がある

  | US2タスク | 編集するファイル | 待つべきUS1タスク |
  |---|---|---|
  | T008 | `frontend/src/app/components/CartItemRow.tsx` | T004 |
  | T009 | `frontend/src/app/cart/page.tsx` | T005 |

- **User Story 3 (P2)**: T002（Foundational）が前提。同様に下表のファイル競合がある

  | US3タスク | 編集するファイル | 待つべきタスク |
  |---|---|---|
  | T011 | `frontend/src/app/components/CartItemRow.tsx` | T008（US2） |
  | T012 | `frontend/src/app/cart/page.tsx` | T009（US2） |

- **User Story 4 (P3)**: `frontend/src/app/cart/page.tsx`に追記するため、T012（US3）の完了が前提

### Within Each User Story

- テスト（あれば）→ コンポーネント/ページの実装 → 状態管理の統合

### Parallel Opportunities

- Foundational: T001・T002は同一ファイルのため並行実行不可（順に実施）
- US1: T003（テスト）・T006（layout.tsx）はT004・T005と別ファイルのため並行実行可能
- US2・US3・US4は、いずれも`CartItemRow.tsx`・`cart/page.tsx`という同じ2ファイルへの追記が連鎖するため、並行実行できず順番に実施する必要がある（US1→US2→US3→US4の順）
- Polish: T015〜T019はすべて並行実行可能

---

## Implementation Strategy

### MVP First（User Story 1のみ）

1. Phase 2: Foundational を完了する
2. Phase 3: User Story 1 を完了する
3. **STOP and VALIDATE**: カート画面が単独で正しく表示されることを確認する
4. ここまでで「カートの中身が分かる」という価値をデモ・検証できる

### Incremental Delivery

1. Foundational → 基盤完成
2. User Story 1 追加 → 独立検証 → デモ（MVP）
3. User Story 2 追加 → 独立検証（数量変更）→ デモ
4. User Story 3 追加 → 独立検証（削除）→ デモ
5. User Story 4 追加 → 独立検証（注文手続きへの導線）→ デモ

### 並行チーム戦略について

本featureはUS2〜US4が同じ2ファイル（`CartItemRow.tsx`・`cart/page.tsx`）への追記が連鎖する構造のため、
002のように担当を分けて並行作業する余地は小さい。1人（または1組）が順番にUS1→US2→US3→US4と
進める方が、ファイル競合による手戻りが少ない。

---

## Notes

- [P]タスク = 別ファイル・依存なし
- [Story]ラベルはトレーサビリティのためにユーザーストーリーへタスクを対応付ける
- 各ユーザーストーリーは独立して完了・検証可能であるべき
- バックエンドAPI・DBスキーマの変更を伴うタスクは存在しない（`contracts/no-new-api.md`）
- 破壊的DB操作を伴うタスクは存在しない（CLAUDE.md禁止事項）
- 論理的なまとまりごと、またはタスクごとにコミットする
- 各チェックポイントでストーリー単独の動作確認を止めて行うこと
