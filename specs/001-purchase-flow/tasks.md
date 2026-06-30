---

description: "Task list for オンライン書店 購買フロー"
---

# Tasks: オンライン書店 購買フロー

**Input**: Design documents from `specs/001-purchase-flow/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: テストフレームワーク未設定のため、テストタスクは含まない。検証は quickstart.md のシナリオ S-01〜S-07 で実施する。

**Organization**: タスクはユーザーストーリー別にフェーズ分けし、各ストーリーを独立して実装・検証できる構成にしている。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（異なるファイル、依存なし）
- **[Story]**: 対応ユーザーストーリー（US1〜US4）
- 各タスクに具体的なファイルパスを記載

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Database**: `mysql/init/`
- **Spec docs**: `specs/001-purchase-flow/`

---

## Phase 1: Setup（ディレクトリ構造の整備）

**Purpose**: プロジェクトのディレクトリ構造を整備し、Pages Router に移行する

- [x] T001 `backend/src/routes/`, `backend/src/services/`, `backend/src/types/` ディレクトリを作成する
- [x] T002 [P] `frontend/src/pages/`, `frontend/src/pages/books/`, `frontend/src/components/`, `frontend/src/services/`, `frontend/src/context/`, `frontend/src/types/` ディレクトリを作成する
- [x] T003 [P] App Router から Pages Router へ移行する: `frontend/src/app/page.tsx` と `frontend/src/app/layout.tsx` を削除し、`frontend/src/pages/_app.tsx` を作成する（グローバルスタイル設定）

---

## Phase 2: Foundational（全ストーリー共通の基盤）

**Purpose**: すべてのユーザーストーリー実装の前提となるDB・型・接続の基盤を整備する

**⚠️ CRITICAL**: このフェーズ完了前にユーザーストーリーの実装を開始してはならない

- [x] T004 `mysql/init/01_init.sql` を books・orders・order_items の3テーブルスキーマに全面書き換えする（data-model.md のスキーマ設計に従う）
- [x] T005 [P] `mysql/init/02_books_seed.sql` を作成し、5冊以上の書籍シードデータを INSERT する（各書籍に title・author・price・description・image_url を設定）
- [x] T006 [P] `backend/src/db.ts` を作成する（mysql2 の promise ベース接続プールを実装し、環境変数 DB_HOST・DB_PORT・DB_NAME・DB_USER・DB_PASSWORD を使用する）
- [x] T007 [P] `backend/src/types/api.ts` を作成する（contracts/api-types.ts の Book・Order・OrderItem・CreateOrderRequest・CreateOrderResponse・ErrorResponse の型定義をバックエンド用に実装する）
- [x] T008 [P] `frontend/src/types/api.ts` を作成する（contracts/api-types.ts の Book・CartItem・Cart・CreateOrderRequest・CreateOrderResponse の型定義をフロントエンド用に実装する）
- [x] T009 `backend/src/index.ts` を更新し、`/books` と `/orders` のルートをマウントする構造にする（ルートファイル作成前にインポート文を追加し、404ハンドラとエラーハンドラも追加する）
- [x] T010 `frontend/src/context/CartContext.tsx` を作成する（React Context でカート状態を管理し、localStorage との同期・addItem・updateQuantity・removeItem・clearCart 操作を実装する）

**Checkpoint**: このフェーズ完了後、`docker compose up --build` でコンテナが起動し `GET /health` が `{"status":"ok"}` を返すこと

---

## Phase 3: User Story 1 - 書籍一覧の閲覧（Priority: P1）🎯 MVP

**Goal**: 書店トップページに書籍がグリッド表示され、詳細画面へ遷移できる

**Independent Test**: quickstart.md の S-01 を実行する — `http://localhost:3000` を開くと書籍一覧が3秒以内に表示されること

### Implementation for User Story 1

- [x] T011 [P] [US1] `backend/src/services/bookService.ts` を作成し、`getAllBooks()` 関数を実装する（`SELECT * FROM books` でDB全書籍を取得し `Book[]` を返す）
- [x] T012 [P] [US1] `backend/src/routes/books.ts` を作成し、`GET /books` ハンドラを実装する（bookService.getAllBooks() を呼び出し `Book[]` を JSON レスポンスで返す。DBエラー時は 500 を返す）
- [x] T013 [P] [US1] `frontend/src/services/bookApi.ts` を作成し、`fetchBooks()` 関数を実装する（`GET /books` を呼び出し `Book[]` を返す。環境変数 `NEXT_PUBLIC_API_URL` をベースURLとして使用する）
- [x] T014 [P] [US1] `frontend/src/components/BookCard.tsx` を作成する（Book props を受け取り、書影・タイトル・著者・価格を表示し、クリックで `/books/[id]` へ遷移するカードコンポーネント）
- [x] T015 [US1] `frontend/src/pages/index.tsx` を作成する（getServerSideProps で fetchBooks() を呼び出し、BookCard のグリッドを表示する商品一覧ページ）

**Checkpoint**: S-01 合格後、User Story 1 は独立してデモ可能

---

## Phase 4: User Story 2 - 書籍詳細の確認とカートへの追加（Priority: P2）

**Goal**: 書籍詳細画面で全情報を確認し、「カートに追加」ボタンでカートに追加して一覧に戻れる

**Independent Test**: quickstart.md の S-02・S-03 を実行する — 詳細5項目が表示され、カートに追加できること

### Implementation for User Story 2

- [x] T016 [P] [US2] `backend/src/services/bookService.ts` に `getBookById(id: number)` 関数を追加する（`SELECT * FROM books WHERE id = ?` で1冊を取得し `Book | null` を返す）
- [x] T017 [P] [US2] `backend/src/routes/books.ts` に `GET /books/:id` ハンドラを追加する（bookService.getBookById() を呼び出し、404または `Book` JSONを返す。id が整数でない場合は 400 を返す）
- [x] T018 [P] [US2] `frontend/src/services/bookApi.ts` に `fetchBookById(id: number)` 関数を追加する（`GET /books/:id` を呼び出し `Book` を返す。404の場合は null を返す）
- [x] T019 [US2] `frontend/src/pages/books/[id].tsx` を作成する（getServerSideProps で fetchBookById() を呼び出し、書影・タイトル・著者・価格・説明文を表示し、「カートに追加」ボタンで CartContext.addItem() を呼び出して `/cart` または一覧へ戻る詳細ページ）

**Checkpoint**: S-02・S-03 合格後、User Stories 1 と 2 の両方が独立して動作すること

---

## Phase 5: User Story 3 - カートの管理（Priority: P3）

**Goal**: カートの書籍一覧・数量変更・削除・合計金額確認・注文手続きへの遷移が動作する

**Independent Test**: quickstart.md の S-04 を実行する — 数量変更・削除・合計更新が1秒以内に反映されること

### Implementation for User Story 3

- [x] T020 [P] [US3] `frontend/src/components/CartItemRow.tsx` を作成する（CartItem props を受け取り、書名・単価・数量（増減ボタン）・小計・削除ボタンを表示するコンポーネント。onQuantityChange と onRemove コールバックを受け取る）
- [x] T021 [US3] `frontend/src/pages/cart.tsx` を作成する（CartContext からカートを取得し、CartItemRow のリスト・合計金額・「注文手続きへ」ボタンを表示するカートページ。CartContext.updateQuantity と removeItem を使用する）

**Checkpoint**: S-04 合格後、User Stories 1・2・3 すべてが独立して動作すること

---

## Phase 6: User Story 4 - 注文の確定と完了（Priority: P4）

**Goal**: 氏名・住所・メールを入力して注文確定し、注文番号が表示される

**Independent Test**: quickstart.md の S-05・S-06・S-07 を実行する — バリデーションエラー・正常注文・注文番号表示がすべて動作すること

### Implementation for User Story 4

- [x] T022 [P] [US4] `backend/src/services/orderService.ts` を作成し、`createOrder(req: CreateOrderRequest)` 関数を実装する（orders テーブルに INSERT し、AUTO_INCREMENT の id から `ORD-XXXXXX` 形式の注文番号を生成し、order_items テーブルに明細を INSERT してトランザクションで処理する）
- [x] T023 [P] [US4] `backend/src/routes/orders.ts` を作成し、`POST /orders` ハンドラを実装する（リクエストボディのバリデーション（必須チェック・email形式チェック・items非空チェック）を実施し、orderService.createOrder() を呼び出して `{ orderNumber }` を 201 で返す）
- [x] T024 [P] [US4] `backend/src/index.ts` を更新し、`/orders` ルート（`backend/src/routes/orders.ts`）をマウントする
- [x] T025 [P] [US4] `frontend/src/services/orderApi.ts` を作成し、`createOrder(req: CreateOrderRequest)` 関数を実装する（`POST /orders` を呼び出し `CreateOrderResponse` を返す）
- [x] T026 [P] [US4] `frontend/src/components/OrderSummary.tsx` を作成する（CartItem[] と totalAmount を props で受け取り、注文商品一覧と合計金額を表示するコンポーネント）
- [x] T027 [US4] `frontend/src/pages/checkout.tsx` を作成する（CartContext からカートを取得し、OrderSummary を表示しながら氏名・住所・メールアドレスの入力フォームをレンダリングする。クライアントサイドバリデーション実施後に orderApi.createOrder() を呼び出し、成功時は `/order-complete?orderNumber=ORD-XXXXXX` にリダイレクトする）
- [x] T028 [US4] `frontend/src/pages/order-complete.tsx` を作成する（URL クエリパラメータ `orderNumber` を取得して注文完了メッセージと注文番号を表示し、「商品一覧に戻る」リンクを設置するページ）

**Checkpoint**: S-05・S-06・S-07 合格後、5画面すべてが購買フローとして連続して動作すること

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: エッジケース対応・最終検証・動作確認

- [x] T029 [P] `frontend/src/pages/checkout.tsx` にカートが空の場合のガードを追加する（CartContext のカートが空ならば `/cart` にリダイレクトする）
- [x] T030 `docker compose down && docker compose up --build` で環境をリビルドし、quickstart.md の S-01〜S-07 すべての検証シナリオを通しで実行して全合格を確認する
- [x] T031 [P] `README.md` に最終的なエンドポイント一覧（GET /books, GET /books/:id, POST /orders）と5画面のURL一覧を追記する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし — 即時開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 — Phase 3〜6 のすべてをブロック
- **Phase 3 (US1)**: Phase 2 完了後 — 他のユーザーストーリーに依存しない
- **Phase 4 (US2)**: Phase 2 完了後、Phase 3 の完了推奨（index.tsx からの遷移テストのため）
- **Phase 5 (US3)**: Phase 2 完了後（CartContext は T010 で実装済み）
- **Phase 6 (US4)**: Phase 2・3・5 完了後（カートに商品を入れてから注文する流れのため）
- **Phase 7 (Polish)**: Phase 6 完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後すぐ開始可能
- **US2 (P2)**: US1 完了推奨（一覧→詳細の遷移確認のため）
- **US3 (P3)**: US2 完了後（カートに商品を追加してから管理する流れのため）
- **US4 (P4)**: US3 完了後（カートから注文へ進む流れのため）

### Within Each User Story

- Backend サービス → Backend ルート → Frontend サービス → Frontend コンポーネント → Frontend ページ
- [P] マーク付きタスクは同一フェーズ内で並行実行可能

### Parallel Opportunities

- T001・T002・T003 は並行実行可能（異なるディレクトリ）
- T005〜T010 は並行実行可能（異なるファイル。T009 は T006 の db.ts 完了後に実施する）
- Phase 3 内: T011・T012・T013・T014 は並行実行可能（T015 はこれら完了後）
- Phase 4 内: T016・T017・T018 は並行実行可能（T019 はこれら完了後）
- Phase 6 内: T022・T023・T025・T026 は並行実行可能（T027 は T025・T026 完了後, T028 は T027 完了後）

---

## Parallel Example: User Story 1

```bash
# Phase 2 完了後、US1 の以下4タスクを同時に着手できる:
Task T011: "Create backend/src/services/bookService.ts with getAllBooks()"
Task T012: "Create backend/src/routes/books.ts with GET /books"
Task T013: "Create frontend/src/services/bookApi.ts with fetchBooks()"
Task T014: "Create frontend/src/components/BookCard.tsx"

# T011〜T014 完了後:
Task T015: "Create frontend/src/pages/index.tsx"
```

## Parallel Example: User Story 4

```bash
# Phase 6 開始時、以下5タスクを同時に着手できる:
Task T022: "Create backend/src/services/orderService.ts with createOrder()"
Task T023: "Create backend/src/routes/orders.ts with POST /orders"
Task T025: "Create frontend/src/services/orderApi.ts with createOrder()"
Task T026: "Create frontend/src/components/OrderSummary.tsx"
# T024 は T023 完了後:
Task T024: "Update backend/src/index.ts to mount /orders route"

# T022〜T026 完了後:
Task T027: "Create frontend/src/pages/checkout.tsx"
# T027 完了後:
Task T028: "Create frontend/src/pages/order-complete.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Phase 1 完了（ディレクトリ整備）
2. Phase 2 完了（DB・型・接続基盤）← **ここが全体のブロッカー**
3. Phase 3 完了（商品一覧）
4. **STOP and VALIDATE**: quickstart.md S-01 を実行して US1 を独立検証
5. デモ可能

### Incremental Delivery

1. Setup + Foundational → 基盤完成
2. US1 追加 → 書籍一覧が動作（MVP）
3. US2 追加 → 詳細閲覧とカート追加が動作
4. US3 追加 → カート管理が動作
5. US4 追加 → 注文完了まで一気通貫

### Parallel Team Strategy

チームで分担する場合:

1. Phase 1・2 を全員で完了させる
2. 基盤完成後:
   - 開発者A: Phase 3 (US1) → Phase 4 (US2)
   - 開発者B: Phase 5 (US3) → Phase 6 (US4)
3. 各ストーリーの Checkpoint を確認してからマージ

---

## Notes

- [P] タスク = 異なるファイル・依存なし → 同時着手可能
- [Story] ラベルは spec.md のユーザーストーリーとのトレーサビリティのため必須
- 各 Checkpoint でストーリーが独立して動作することを確認してから次フェーズへ
- テストなし → quickstart.md の S-01〜S-07 が合否の唯一の判断基準
- `docker compose up --build` で環境を再構築してから検証すること
