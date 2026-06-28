---
description: "カート機能（追加・変更・削除）のタスクリスト"
---

# Tasks: カート機能（追加・変更・削除）

**Input**: Design documents from `specs/002-cart-management/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/cart-context.md ✅, research.md ✅

**Tests**: テストタスクは仕様書に明示的な要求がないため含まない。quickstart.md の手動シナリオで検証する。

**Organization**: タスクはユーザーストーリー単位でグループ化。各ストーリーは独立して実装・テスト可能。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: どのユーザーストーリーのタスクか（US1, US2, US3）
- 各タスクには正確なファイルパスを含める

---

## Phase 1: Setup（初期化）

**Purpose**: 型定義など全フェーズで共有するファイルの作成

- [x] T001 frontend/src/types/index.ts を新規作成し、`Book`・`CartItem`・`CartState`・`CartContextValue` インターフェースを定義する（data-model.md の型定義に基づく）

---

## Phase 2: Foundational（全ストーリーの前提）

**Purpose**: CartContext（カート状態管理）とProvider設定 — このフェーズ完了まですべてのユーザーストーリー実装を開始できない

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 frontend/src/context/CartContext.tsx を新規作成し、`items`・`totalAmount` 状態と `addToCart`（同一bookIdの場合は数量加算）・`updateQuantity`（下限1未満への変更は無視）・`removeFromCart`・`clearCart` 関数を実装する（contracts/cart-context.md の状態変化規則に準拠）
- [x] T003 frontend/src/pages/_app.tsx を更新し、`CartProvider` でアプリ全体をラップしてカート状態をすべてのページで共有できるようにする

**Checkpoint**: CartContext が利用可能になり、各ページから useCart() で状態を参照・操作できる状態

---

## Phase 3: User Story 1 - 書籍をカートに追加する (Priority: P1) 🎯 MVP

**Goal**: 書籍詳細画面から「カートに追加」ボタンを押すと書籍がカートに追加され、商品一覧へ戻る。同一書籍の再追加は数量加算される。

**Independent Test**: `http://localhost:3000/books/1` を開いて「カートに追加」を押す → `/` へ遷移すること。`/cart` を開いて書籍が1件（数量1）あることを確認。同じ書籍を再度追加すると数量が2になること（[quickstart.md](quickstart.md) シナリオ1・2）

### Implementation for User Story 1

- [x] T004 [US1] frontend/src/pages/books/[id].tsx に `useCart` フックをインポートし、「カートに追加」ボタンを追加して押下時に `addToCart(book)` を呼び出し `router.push('/')` で商品一覧へリダイレクトする実装を加える

**Checkpoint**: 書籍詳細から書籍をカートに追加できる。/cart で追加した書籍を確認できる（US2完成後）

---

## Phase 4: User Story 2 - カート内容を確認し数量を調整する (Priority: P2)

**Goal**: カート画面（`/cart`）に書名・単価・数量・小計・合計金額を表示し、数量を増減するとリアルタイムに小計・合計が更新される。カートが空の場合は空メッセージを表示する。

**Independent Test**: カートに書籍が入っている状態で `/cart` を開く → 書名・単価・数量・小計・合計が表示されること。増減ボタンで即時更新されること。数量1のとき−ボタンが非活性であること（[quickstart.md](quickstart.md) シナリオ3・5・6）

### Implementation for User Story 2

- [x] T005 [P] [US2] frontend/src/components/CartItem.tsx を新規作成し、書名・単価・数量・小計を表示し、増加ボタン（+）・減少ボタン（−：数量1のときdisabled）を実装して `updateQuantity(bookId, newQty)` を呼び出す
- [x] T006 [P] [US2] frontend/src/components/CartSummary.tsx を新規作成し、カート合計金額（送料除く）を表示するコンポーネントを実装する
- [x] T007 [US2] frontend/src/pages/cart.tsx を新規作成し、`CartItem` と `CartSummary` を組み合わせてカート一覧と合計金額を表示する。カートが空の場合は「カートに商品がありません」メッセージを表示し、空でない場合は「注文手続きへ」ボタンを表示して `/order` へ遷移させる

**Checkpoint**: /cart でカートの全内容が表示され、数量変更で即時合計が更新される。US1・US2 が独立して動作する

---

## Phase 5: User Story 3 - カートから書籍を削除する (Priority: P3)

**Goal**: カート画面の削除ボタンを押すと書籍がカートから除去され、合計金額が即時更新される。最後の1冊を削除すると空カートメッセージが表示される。

**Independent Test**: カートに書籍がある状態で削除ボタンを押す → 書籍が消え合計が即時更新されること。最後の1冊削除後に空メッセージが表示されること（[quickstart.md](quickstart.md) シナリオ4・5）

### Implementation for User Story 3

- [x] T008 [US3] frontend/src/components/CartItem.tsx に削除ボタンを追加し、押下時に `removeFromCart(bookId)` を呼び出す実装を加える（T005で作成したファイルを更新）

**Checkpoint**: US1・US2・US3 がすべて独立して動作する。追加・数量変更・削除の3操作が完動する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 品質向上と横断的な懸念事項への対応

- [x] T009 [P] frontend/src/components/CartItem.tsx と frontend/src/components/CartSummary.tsx のスタイリングを整え、カート画面のレイアウトを仕様書の表形式（書名・単価・数量・小計）に合わせる
- [ ] T010 [P] frontend/src/types/index.ts の型定義が全コンポーネントで正しく参照されていることを `tsc --noEmit` で確認する（TypeScript strict モード）
- [ ] T011 [quickstart.md](quickstart.md) の6シナリオ（カート追加・重複加算・数量変更・削除・空カート・複数書籍管理）を手動で実行して動作確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。即座に開始可能
- **Foundational (Phase 2)**: Phase 1 完了後に開始。全ユーザーストーリーをブロック
- **User Story 1 (Phase 3)**: Phase 2 完了後に開始
- **User Story 2 (Phase 4)**: Phase 2 完了後に開始（Phase 3 と並列実行可能だが、カート追加がないと手動確認が困難）
- **User Story 3 (Phase 5)**: Phase 4 完了後に開始（CartItem.tsx の修正のため）
- **Polish (Phase 6)**: Phase 5 完了後に開始

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完了後に独立して実装可能
- **User Story 2 (P2)**: Phase 2 完了後に独立して実装可能（Phase 3 と並列可能）
- **User Story 3 (P3)**: US2 の CartItem.tsx 作成後（T005）に開始可能

### Within Each User Story

- T005 と T006 は並列実行可能（異なるファイル）
- T007 は T005・T006 完了後（CartItem と CartSummary を使用するため）
- T008 は T005 完了後（CartItem.tsx を修正するため）

### Parallel Opportunities

```bash
# Phase 1（1タスクのみ）
Task: T001 types/index.ts

# Phase 2（順次）
Task: T002 CartContext.tsx
Task: T003 _app.tsx（T002 完了後）

# Phase 3（1タスクのみ）
Task: T004 books/[id].tsx

# Phase 4（T005・T006 は並列）
Task: T005 CartItem.tsx      ─┐ 並列実行可能
Task: T006 CartSummary.tsx   ─┘
Task: T007 cart.tsx（T005・T006 完了後）

# Phase 5
Task: T008 CartItem.tsx に削除ボタン追加（T005 完了後）

# Phase 6（T009・T010 は並列）
Task: T009 スタイリング       ─┐ 並列実行可能
Task: T010 型チェック          ─┘
Task: T011 手動確認（T009・T010 完了後）
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: T001（型定義）
2. Phase 2: T002・T003（CartContext + Provider）
3. Phase 3: T004（書籍詳細に追加ボタン）
4. **STOP and VALIDATE**: /books/:id → カート追加 → /cart でカートに書籍があることを確認
5. US2 が完成すれば /cart の表示も確認可能

### Incremental Delivery

1. Phase 1 + 2 → CartContext 準備完了
2. Phase 3 (US1) → 「カートに追加」動作確認
3. Phase 4 (US2) → カート画面で内容確認・数量調整
4. Phase 5 (US3) → 削除機能追加
5. Phase 6 → 品質向上

---

## Notes

- [P] タスク = 異なるファイル、互いに依存なし
- [Story] ラベルはタスクをユーザーストーリーにトレース可能にする
- カートはフロントエンドのReact Contextで完結。バックエンド変更なし
- T008 は T005 で作成した CartItem.tsx への追記。ファイルの競合に注意
- quickstart.md の動作確認シナリオをこまめに実行して各ストーリーを独立検証する
