---
description: "注文フォームと注文確定処理のタスクリスト"
---

# Tasks: 注文フォームと注文確定処理

**Input**: Design documents from `specs/003-order-checkout/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, research.md ✅

**Tests**: テストタスクは仕様書に明示的な要求がないため含まない。quickstart.md のシナリオで手動検証する。

**Organization**: タスクはユーザーストーリー単位でグループ化。各ストーリーは独立して実装・テスト可能。

**Note**: specs/001-purchase-flow の実装で以下のファイルがすでに存在する:
`backend/src/models/order.ts`, `backend/src/services/order_service.ts`,
`backend/src/api/orders.ts`, `backend/database/migrations/002_create_orders.sql`,
`frontend/src/services/order_api.ts`, `frontend/src/components/OrderForm.tsx`,
`frontend/src/components/CartSummary.tsx`（002-cart-management 実装済み）,
`frontend/src/pages/order.tsx`, `frontend/src/pages/order/complete.tsx`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: どのユーザーストーリーのタスクか（US1, US2, US3）
- 各タスクには正確なファイルパスを含める

---

## Phase 1: Setup（インフラ準備）

**Purpose**: DBマイグレーションとフロントエンドAPIクライアントの準備

- [x] T001 backend/database/migrations/002_create_orders.sql を新規作成し orders・order_items テーブルの DDL を記述する（data-model.md の DDL に基づく）
- [x] T002 [P] frontend/src/services/order_api.ts を新規作成し POST /api/orders を呼び出す createOrder() 関数を実装する（contracts/orders-api.md に準拠）

---

## Phase 2: Foundational（バックエンド注文API — US3の前提）

**Purpose**: 注文確定APIの構築。このフェーズ完了まで US3 の注文確定処理が動作しない。

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 backend/src/models/order.ts を新規作成し Order・OrderItem 型定義と注文INSERT・注文番号採番（ORD-{YYYYMMDD}-{id}形式）・トランザクション処理を実装する（data-model.md のエンティティに基づく）
- [x] T004 backend/src/services/order_service.ts を新規作成し createOrder() サービス関数（氏名・住所必須チェック・メール形式バリデーション・items 件数チェック）を実装する（T003 完了後）
- [x] T005 backend/src/api/orders.ts を新規作成し POST /api/orders エンドポイントを実装して order_service を呼び出す（400/422/500 レスポンス形式は contracts/orders-api.md に準拠、T004 完了後）

**Checkpoint**: `curl -X POST http://localhost:4000/api/orders -H "Content-Type: application/json" -d '{...}'` が 201 または 400 を返すこと

---

## Phase 3: User Story 1 - 注文フォームにカート内容を確認しながら注文情報を入力する (Priority: P1) 🎯 MVP

**Goal**: /order にアクセスするとカート内容（書名・単価・数量・小計・合計）と氏名・住所・メールの入力フィールドが同一画面に表示される。カートが空の場合は /cart へリダイレクトされる。

**Independent Test**: カートに書籍がある状態で /order を開くとカート内容と入力フォームが表示されること。カートが空の状態で /order へ直接アクセスすると /cart にリダイレクトされること（[quickstart.md](quickstart.md) シナリオ4）

### Implementation for User Story 1

- [x] T006 [P] [US1] frontend/src/components/CartSummary.tsx を新規作成し注文フォームページ内でカート内書名・単価・数量・小計と合計金額を表示するコンポーネントを実装する（002-cart-management で実装済み）
- [x] T007 [US1] frontend/src/pages/order.tsx を新規作成し CartSummary（注文内容確認）と注文入力フィールドを同一画面に表示し、カートが空の場合は router.replace('/cart') でリダイレクトする（T006 完了後）

**Checkpoint**: /order でカート内容確認と入力フィールドが表示される。空カートリダイレクトが動作する

---

## Phase 4: User Story 2 - バリデーションエラーを確認して修正する (Priority: P2)

**Goal**: 必須項目が未入力または形式不正の状態で「注文する」を押すと該当フィールドにエラーメッセージが表示され注文処理が中断される。全必須項目が同時にエラー表示される。修正後に再送信できる。

**Independent Test**: /order で全フィールドを空にして「注文する」を押す → 3フィールド全にエラーが表示されること。メール欄に `test-email` を入力して押す → メール形式エラーのみ表示されること（[quickstart.md](quickstart.md) シナリオ2・3）

### Implementation for User Story 2

- [x] T008 [US2] frontend/src/components/OrderForm.tsx を新規作成し氏名・住所・メールアドレスのフィールドとクライアントサイドバリデーション（必須チェック・メール形式チェック）・フィールド個別エラーメッセージ・「注文する」ボタンを実装し、バリデーション通過時に onSubmit コールバックを呼び出す
- [x] T009 [US2] frontend/src/pages/order.tsx を更新し直接フィールド定義から OrderForm コンポーネントを使う形に変更してバリデーション失敗時にページ送信を中断するよう統合する（T008 完了後）

**Checkpoint**: 未入力・メール形式不正でエラーが表示され注文が処理されない。修正後は正常に送信できる

---

## Phase 5: User Story 3 - 注文を確定して注文番号を受け取る (Priority: P3)

**Goal**: 全バリデーション通過後に「注文する」を押すと注文が確定し、/order/complete?orderNumber=xxx へ遷移して注文完了メッセージと注文番号が表示される。「商品一覧へ戻る」リンクが機能する。注文確定後にカートがクリアされる。

**Independent Test**: 正しい情報を入力して「注文する」を押す → /order/complete に注文番号が表示されること。注文番号が毎回異なること（重複なし）。「商品一覧へ戻る」で / へ遷移すること（[quickstart.md](quickstart.md) シナリオ1）

### Implementation for User Story 3

- [x] T010 [P] [US3] frontend/src/pages/order/complete.tsx を新規作成し URL クエリパラメータから orderNumber を取得して注文完了メッセージと注文番号を表示し「商品一覧へ戻る」リンク（/）を設ける
- [x] T011 [US3] frontend/src/pages/order.tsx を更新し「注文する」ボタン押下で order_api.ts の createOrder() を呼び出し成功時に clearCart() を実行して /order/complete?orderNumber=xxx へ router.push する（PRGパターン、T010・T002 完了後）

**Checkpoint**: US1〜US3 がすべて組み合わさって注文フォーム→注文完了の正常系フルフローが動作する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 品質確認と二重送信防止の検証

- [x] T012 [P] backend/src/api/orders.ts のレスポンス形式が contracts/orders-api.md に完全準拠していることを確認する（バリデーションエラー 400・空カート 422・サーバーエラー 500 のJSON構造）
- [x] T013 backend/src/services/order_service.ts のサーバーサイドバリデーション（未入力・メール形式・items 件数）が frontend の OrderForm バリデーションと一致していることを確認する（二重チェックの整合性）
- [ ] T014 [quickstart.md](quickstart.md) の4シナリオ（正常系注文確定・必須未入力・メール形式不正・空カートリダイレクト）と curl テストを実行して動作確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。即座に並列開始可能
- **Foundational (Phase 2)**: Phase 1 完了後。T003 → T004 → T005 の順に実行
- **User Story 1 (Phase 3)**: Phase 2 完了後（cart.tsx が別途実装済みであることが前提）
- **User Story 2 (Phase 4)**: Phase 3 完了後（OrderForm は order.tsx に組み込む）
- **User Story 3 (Phase 5)**: Phase 4 完了後（バリデーション通過後の送信フローのため）
- **Polish (Phase 6)**: Phase 5 完了後

### User Story Dependencies

- **User Story 1 (P1)**: CartSummary（002実装済み）と Foundational 完了後に開始可能
- **User Story 2 (P2)**: US1 完了後（order.tsx の基本表示を前提とする）
- **User Story 3 (P3)**: US2 完了後（バリデーション済みの送信フローを前提とする）

### Within Each User Story

- T006 と T007 は T006 が先に完了している必要がある（CartSummary を order.tsx が使用）
- T008 と T010 は並列実行可能（異なるファイル）
- T009 は T008 完了後（OrderForm を order.tsx に統合するため）
- T011 は T010・T002 完了後（complete.tsx と order_api.ts を使用するため）

### Parallel Opportunities

```bash
# Phase 1（並列）
T001 002_create_orders.sql     ─┐ 並列実行可能
T002 frontend/services/order_api.ts ─┘

# Phase 2（順次）
T003 backend/models/order.ts
T004 backend/services/order_service.ts  (T003 後)
T005 backend/api/orders.ts              (T004 後)

# Phase 3
T006 CartSummary.tsx           ─┐ 並列実行可能（T006 は 002 実装済みの確認のみ）
T007 pages/order.tsx           ─┘ (T006 後)

# Phase 4
T008 OrderForm.tsx             ─ 単独
T009 pages/order.tsx 更新      (T008 後)

# Phase 5
T010 order/complete.tsx        ─┐ 並列実行可能
(T002 は Phase 1 で完了済み)    ─┘
T011 pages/order.tsx 更新      (T010・T002 後)

# Phase 6（T012・T013 並列）
T012 orders.ts レスポンス確認   ─┐ 並列
T013 バリデーション整合確認      ─┘
T014 手動テスト                 (T012・T013 後)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: T001・T002（インフラ準備）
2. Phase 2: T003〜T005（バックエンドAPI構築）
3. Phase 3: T006〜T007（注文フォーム基本表示）
4. **STOP and VALIDATE**: /order でカート内容と入力フィールドが表示されること・空カートリダイレクトが動作すること

### Incremental Delivery

1. Phase 1 + 2 → バックエンドAPI稼働（curl で検証可能）
2. Phase 3 (US1) → フォーム表示・空カートリダイレクト動作
3. Phase 4 (US2) → バリデーション機能追加
4. Phase 5 (US3) → 注文確定・完了画面（フル購買フロー完成）
5. Phase 6 → 品質確認・手動テスト

---

## Notes

- [P] タスク = 異なるファイル、互いに依存なし
- [Story] ラベルはタスクをユーザーストーリーにトレース可能にする
- T001〜T011 は specs/001-purchase-flow と specs/002-cart-management の実装で完了済み（[x] マーク）
- T012〜T014 のみ未完了（手動確認・品質検証タスク）
- 二重送信防止は PRG パターン（T011）で対応済み
- DB接続情報は必ず .env から読み込む。コードへの直書きは厳禁（憲法 III章）
