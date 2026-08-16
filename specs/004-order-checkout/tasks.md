---
description: "Task list template for feature implementation"
---

# Tasks: 注文フォーム・注文完了画面

**Input**: Design documents from `/specs/004-order-checkout/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/orders-api.md, quickstart.md

**Tests**: 002-book-catalog-detailで導入済みのVitest + Supertest（backend）、Vitest + React Testing Library（frontend）、
Playwright（E2E）を継続利用する（憲法セクション2のテスト基準を満たす範囲）。本機能はバックエンド側にはじめて
テスト対象コード（`orderRepository.ts`・`ordersRoutes.ts`）が追加される。

**Note**: プロジェクトの土台（`docker-compose.yml`・各`package.json`・Lint/テスト基盤）は002で構築済みのため、
Setupフェーズの作業は発生しない。また、本機能の新規モジュールはいずれか1つのユーザーストーリーにのみ属し
（バックエンドAPIはUS2、`OrderSummary.tsx`・`order/page.tsx`の初期表示はUS1、完了画面はUS3）、
複数ストーリーが共通して依存する基盤要素はないため、Foundationalフェーズの作業もない
（003と同様の構成。003の`cartStore`拡張のような「複数ストーリーが依存する共通処理」に相当するものが本機能にはない）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル・未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- 各タスクは正確なファイルパスを含む

## Path Conventions

`backend/src/`, `backend/tests/`, `frontend/src/app/`, `frontend/tests/`, `mysql/init/`, `e2e/tests/`
（002-book-catalog-detail・003-cart-managementの構成を継続）

---

## Phase 1: Setup

**Purpose**: プロジェクト初期化。本機能では新規依存パッケージ・スキャフォールディングが不要なため対象タスクなし。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 複数ユーザーストーリーが共通して依存する基盤要素。本機能には該当するものがないため対象タスクなし
（詳細は上記Note参照）。

---

## Phase 3: User Story 1 - 注文内容を確認しながら顧客情報を入力する (Priority: P1) 🎯 MVP

**Goal**: 注文フォーム画面（`/order`）に、カート内の注文商品（書名・単価・数量・小計）と合計金額、および氏名・住所・
メールアドレスの入力欄を表示する（この時点ではバリデーション・送信処理は持たない）

**Independent Test**: カートに書籍が入っている状態で`/order`を開き、注文商品一覧・合計金額が表示され、氏名・住所・
メールアドレスの入力欄が表示されることを確認する

### Tests for User Story 1

- [x] T001 [P] [US1] Component test for `frontend/src/app/components/OrderSummary.tsx` in `frontend/tests/OrderSummary.test.tsx`（React Testing Library）: `items`・`totalAmount`を渡した場合の書名・単価・数量・小計・合計金額の表示を検証
- [x] T002 [P] [US1] Component test for `frontend/src/app/order/page.tsx` in `frontend/tests/OrderPage.test.tsx`（React Testing Library）: カート内容（`booksApi.listBooks`・`cartStore.getItems`をモック）の表示、氏名・住所・メールアドレス入力欄の表示を検証

### Implementation for User Story 1

- [x] T003 [US1] Create `frontend/src/app/components/OrderSummary.tsx`: `items`（`bookId`・`title`・`price`・`quantity`）と`totalAmount`をpropsで受け取り、読み取り専用で一覧・合計金額を表示する（FR-001。003の`CartItemRow.tsx`と異なり編集操作は持たない。detail-design.html参照）
- [x] T004 [US1] Create `frontend/src/app/order/page.tsx`: 003の`cart/page.tsx`と同じ合成ロジックで`booksApi.listBooks()`と`cartStore.getItems()`を突き合わせ、販売対象外の項目を除いた表示データを`OrderSummary`（T003）に渡す。氏名・住所・メールアドレスの入力欄（この時点では`state`保持のみ、バリデーション・送信なし）を表示する（FR-001, FR-002）。T003完了後に着手する

**Checkpoint**: この時点で注文フォーム画面の閲覧（US1）は単独で完結し、デモ・検証が可能（003で作成済みの「注文手続きへ」リンクがはじめて到達可能になる）

---

## Phase 4: User Story 2 - 入力ミスに気づき、注文を確定する (Priority: P2)

**Goal**: 氏名・住所・メールアドレスの未入力・形式不正時にエラーメッセージを表示し、3項目すべて有効な場合は
「注文する」ボタン1つで注文をバックエンドに永続化し、注文番号を発行した上で注文完了画面へ遷移する。
確定後はカートをクリアする

**Independent Test**: 氏名・住所・メールアドレスのいずれかを未入力またはメールアドレスの形式を不正にした状態で
「注文する」を押し、エラーメッセージが表示され画面に留まることを確認する。3項目すべて正しく入力して
「注文する」を押し、注文完了画面へ遷移し、カートが空になっていることを確認する

### Tests for User Story 2

- [x] T005 [P] [US2] Contract test for `POST /api/orders` in `backend/tests/ordersRoutes.test.ts`（Supertest、`orderRepository`をモック）: 正常系（201、スナップショットを含むレスポンス形状）・未入力/空文字（400 `validation_error`、`details`）・メール形式不正（400）・`items`が空配列（400）・`orderRepository`が`UnavailableItemsError`をthrowした場合（400 `unavailable_items`、`bookIds`）・予期しない例外（500）を検証（`contracts/orders-api.md`準拠）
- [x] T006 [P] [US2] Unit test for `createOrder()` in `backend/tests/orderRepository.test.ts`（`pool.getConnection()`をモック）: `books`存在・販売可否確認クエリ、`orders`→`order_items`への順序だてたINSERT、注文番号のフォーマット（`ORD-`+6桁ゼロ埋め、research.md #1）、存在しない/`is_for_sale=0`の`bookId`がある場合に`rollback()`し`UnavailableItemsError`をthrowすることを検証
- [x] T007 [P] [US2] Unit test for `createOrder()` in `frontend/tests/ordersApi.test.ts`（`fetch`をモック）: 201時の戻り値（`OrderResult`）、400（`validation_error`/`unavailable_items`）時に対応する専用エラークラスをthrowすること、500・ネットワーク例外時に汎用`Error`をthrowすることを検証
- [x] T008 [P] [US2] Unit test for `clear()` in `frontend/tests/cartStore.test.ts`（追記）: `clear()`実行後に`getItems()`が空配列を返すことを検証
- [x] T009 [US2] Component test for `order/page.tsx` validation/submit flow in `frontend/tests/OrderPage.test.tsx`（追記、`ordersApi.createOrder`をモック。T002と同一ファイルのため、T002完了後に着手する）: (a) 氏名・住所・メールアドレスのいずれかが未入力の状態で「注文する」を押すと該当項目にエラーが表示され`createOrder`が呼ばれないこと（FR-003）、(b) メールアドレスの形式が不正な場合も同様にエラーが表示されること（FR-004）、(c) `createOrder`が`ValidationError`をthrowした場合に該当項目へエラーメッセージが反映されること、(d) `UnavailableItemsError`をthrowした場合に汎用エラーメッセージが表示されること、(e) 成功時に`cartStore.clear()`が呼ばれ、`router.push`で`/order/complete?orderNumber=...`へ遷移することを検証する

### Implementation for User Story 2

- [x] T010 [P] [US2] Create `mysql/init/02_orders_seed.sql`: `orders`・`order_items`テーブルを`CREATE TABLE IF NOT EXISTS`で作成する（`table-definition.html`準拠。外部キー・インデックスを含む。初期データは投入しない。`DROP`/`TRUNCATE`/`DELETE`は含めない、CLAUDE.md禁止事項）
- [x] T011 [P] [US2] Create `backend/src/types/order.ts`: `OrderItemRequest`, `OrderRequest`, `CreateOrderInput`, `OrderResponseItem`, `OrderResult`の型定義（detail-design.html参照）
- [x] T012 [US2] Implement `createOrder(input: CreateOrderInput): Promise<OrderResult>` in `backend/src/repositories/orderRepository.ts`: 単一トランザクション上で`books`の存在・販売可否（`is_for_sale=1`）を確認し、いずれか不足があれば`rollback()`して`UnavailableItemsError`（`bookIds`保持）をthrow。問題なければ書名・単価のスナップショットで`total_amount`を算出して`orders`にINSERT、続けて`order_items`に複数INSERTし、`commit()`後に採番済み`id`から注文番号（`ORD-`+6桁ゼロ埋め）を生成して返す（research.md #1, #2, #3, #4、detail-design.html図D1）。T011完了後に着手する
- [x] T013 [US2] Implement `POST /` handler in `backend/src/routes/ordersRoutes.ts`: `customerName`/`customerAddress`/`customerEmail`の未入力・空文字、メール形式（`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`相当）、`items`が空配列であることを検証し、問題があれば`orderRepository.createOrder()`を呼ばず400 `validation_error`（`details`配列）を返す。問題なければT012の`createOrder()`を呼び出し、`UnavailableItemsError`は400 `unavailable_items`、その他の例外は`console.error`でログ出力の上500 `internal_server_error`、成功時は201で`OrderResult`を返す（detail-design.html図D2、`contracts/orders-api.md`準拠）。T012完了後に着手する
- [x] T014 [US2] Modify `backend/src/index.ts`: `ordersRouter`（T013）をimportし`app.use("/api/orders", ordersRouter)`を追加する。T013完了後に着手する
- [x] T015 [P] [US2] Implement `createOrder(input: OrderRequest): Promise<OrderResult>` in `frontend/src/app/lib/ordersApi.ts`: `POST /api/orders`を呼び出し、201は`OrderResult`を返す。400 `validation_error`は`ValidationError`（`details`保持）、400 `unavailable_items`は`UnavailableItemsError`（`bookIds`保持）をthrowし、500・ネットワーク例外は汎用`Error`をthrowする（`apiClient.ts`の`fetchJson`は再利用しない。detail-design.html図D3）
- [x] T016 [P] [US2] Add `clear(): boolean` to `frontend/src/app/lib/cartStore.ts`: `localStorage`の`STORAGE_KEY`を空配列で上書きする。既存関数と同様に書き込み失敗時は`try/catch`で捕捉し`false`を返す
- [x] T017 [US2] `frontend/src/app/order/page.tsx`（T004）に、氏名・住所・メールアドレスのクライアント側バリデーション（未入力・メール形式、FR-003, FR-004）と、該当項目へのエラーメッセージ表示を実装する。「注文する」押下時はバリデーション通過後にボタンを非活性化し、T015の`ordersApi.createOrder()`を呼び出す。成功時はT016の`cartStore.clear()`を呼んでから、`router.push` で `/order/complete?orderNumber=${orderNumber}` へ遷移する（FR-005, FR-006, research.md #6）。`ValidationError`/`UnavailableItemsError`/その他の例外はそれぞれ対応するエラー表示を行い、ボタンを再活性化する（detail-design.html図D4）。T004・T015・T016完了後に着手する。バリデーション関数`validate(fields)`は、`page.tsx`からの名前付きexportがNext.jsの型チェックに抵触するため、新規`frontend/src/app/lib/orderValidation.ts`に切り出してimportする（plan.md Project Structureにはなかったファイルの追加。detail-design.html参照）

**Checkpoint**: US1とUS2が独立して動作する（注文内容確認＋顧客情報入力＋注文確定）

---

## Phase 5: User Story 3 - 注文完了を確認し、一覧へ戻る (Priority: P3)

**Goal**: 注文完了画面（`/order/complete`）に注文完了メッセージ・注文番号・商品一覧へ戻るリンクを表示する

**Independent Test**: `/order/complete?orderNumber=ORD-000001`のようなURLに直接アクセスし、注文完了メッセージと
注文番号が表示されることを確認する。「商品一覧へ戻る」リンクを選択すると商品一覧画面（`/`）へ遷移することを確認する

### Tests for User Story 3

- [x] T018 [P] [US3] Component test for `frontend/src/app/order/complete/page.tsx` in `frontend/tests/OrderCompletePage.test.tsx`（React Testing Library）: `orderNumber`クエリパラメータがある場合の完了メッセージ・注文番号の表示、「商品一覧へ戻る」リンクの遷移先（`/`）、`orderNumber`が無い場合に注文番号欄を表示しないことを検証

### Implementation for User Story 3

- [x] T019 [US3] Create `frontend/src/app/order/complete/page.tsx`: `useSearchParams()`で`orderNumber`クエリパラメータを読み取り、注文完了メッセージ（I-33, FR-007）・注文番号（I-34, FR-008）・「商品一覧へ戻る」リンク（I-35, FR-009）を表示する。backend・MySQLとの通信は行わない（basic-design.html 図6）。`orderNumber`が取得できない場合は注文番号欄を表示しない軽微なガードのみ行う（spec.md Edge Casesの前提を踏襲、detail-design.html参照）

**Checkpoint**: 全ユーザーストーリー（US1・US2・US3）が独立に動作する（注文フォーム画面から注文完了画面までの購買フロー全体が完成）

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる仕上げ作業

- [x] T020 [P] Create `e2e/tests/order-checkout.spec.ts`: `quickstart.md`の動作確認シナリオ（1〜7）を、カートに書籍を追加するところから通しでPlaywrightで自動化する
- [x] T021 [P] `quickstart.md`「API動作確認」の`curl`コマンドで`POST /api/orders`の正常系・異常系を確認する
- [x] T022 [P] `npm run build`（型チェック）を`backend/`と`frontend/`の両方で実行し、型エラーがないことを確認する
- [x] T023 [P] `npm run lint`を`backend/`と`frontend/`の両方で実行し、Lintエラー0件を確認する（憲法セクション1）
- [x] T024 [P] `vitest run --coverage`を`backend/`と`frontend/`の両方で実行し、カバレッジ80%以上（憲法セクション2の暫定基準）であることを確認する
- [x] T025 [P] 注文フォーム・注文完了画面の入力欄・ボタン・リンクがキーボード操作のみで実行できることを確認する（WCAG 2.1 AA、憲法セクション3）。`e2e/tests/order-checkout.spec.ts`にキーボード操作のみで入力〜送信〜戻るリンクまで到達できることを検証するE2Eテストを追加して確認した

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 対象タスクなし
- **Foundational (Phase 2)**: 対象タスクなし。US1・US2・US3はいずれも即開始可能（ただし下記ファイル競合には注意）
- **User Stories (Phase 3-5)**: 全ストーリーがFoundational非依存で並行着手可能
- **Polish (Phase 6)**: 対象とするユーザーストーリーが完了した後

### User Story Dependencies

- **User Story 1 (P1)**: 依存なし。即開始可能
- **User Story 2 (P2)**: 依存なし、即開始可能（backend側T010〜T014・frontend側T015・T016はUS1と無関係に並行して進められる）。ただし下表の2タスクのみ、US1が新規作成する同じファイルに追記する形になるため、対応するUS1タスクの完了を待ってから着手する必要がある

  | US2タスク | 編集するファイル | 待つべきUS1タスク |
  |---|---|---|
  | T009 | `frontend/tests/OrderPage.test.tsx` | T002 |
  | T017 | `frontend/src/app/order/page.tsx` | T004 |

- **User Story 3 (P3)**: 依存なし。即開始可能。`order/complete/page.tsx`はUS1・US2のいずれとも編集ファイルが重ならない新規ファイルであり、`orderNumber`をクエリパラメータとして直接与えることで単独検証できる（実際の到達導線はUS2のT017が担う）

### Within Each User Story

- テスト（あれば）→ バックエンド（型→リポジトリ→ルート→マウント）→ フロントエンドAPI呼び出し → UIコンポーネント → ページ統合

### Parallel Opportunities

- US1: T001・T002（テスト）は並行実行可能。T003・T004は同一の合成ロジックを介するがファイルは別のため、T003完了後T004という順序のみ守れば良い
- US2: T005〜T008（テスト）は並行実行可能。T009はT002（US1）と同一ファイルへの追記のため、T002完了後に着手する（他のUS2テストとは並行実行可能）。T010（DBスキーマ）・T011（型）・T015（`ordersApi.ts`）・T016（`cartStore.ts`）は互いに別ファイルのため並行実行可能。T012は T011、T013は T012、T014は T013の完了を待つ（同一の呼び出し連鎖のため順次実施）。T017はT004（US1）・T015・T016の全完了を待つ
- US3: T018（テスト）・T019（実装）は他ストーリーと並行実行可能
- US1・US2・US3は全体として、担当を分ければPhase 3〜5を並行して進められる（上表の2件を除き、編集ファイルの衝突がないため）
- Polish: T020〜T025はすべて並行実行可能

---

## Implementation Strategy

### MVP First（User Story 1のみ）

1. Phase 3: User Story 1 を完了する
2. **STOP and VALIDATE**: 注文フォーム画面が単独で正しく表示されることを確認する
3. ここまでで「注文内容を確認しながら顧客情報を入力できる」という価値をデモ・検証できる（注文確定はまだできない）

### Incremental Delivery

1. User Story 1 追加 → 独立検証 → デモ（MVP。表示のみ）
2. User Story 2 追加 → 独立検証（バリデーション＋注文確定＋DB永続化）→ デモ
3. User Story 3 追加 → 独立検証（完了画面の表示・戻り導線）→ デモ
4. User Story 2 完了後、US1〜US3が繋がって購買フロー全体（カート→注文フォーム→注文完了）が完成する

### 並行チーム戦略について

本featureはUS1・US2・US3の間でファイル競合がほぼない（T009・T017のみUS1のT002・T004完了待ち）ため、
2〜3人で並行して進めやすい構造になっている。

- 1人目はUser Story 1（`OrderSummary.tsx`・`order/page.tsx`の表示部分）を担当する
- 2人目はUser Story 2のバックエンド一式（`mysql/init/02_orders_seed.sql`〜`ordersRoutes.ts`〜`index.ts`）と`ordersApi.ts`・`cartStore.clear()`を担当する。1人目のT002完了後にT009（検証・送信フローのテスト追記）へ、T004完了後にT017（`order/page.tsx`へのバリデーション・送信処理の統合）へ進む
- 3人目はUser Story 3（`order/complete/page.tsx`）を担当する。`orderNumber`をクエリパラメータとして直接与えれば他ストーリーの完了を待たずに単独で実装・検証できる

---

## Notes

- [P]タスク = 別ファイル・依存なし
- [Story]ラベルはトレーサビリティのためにユーザーストーリーへタスクを対応付ける
- 各ユーザーストーリーは独立して完了・検証可能であるべき
- 破壊的DB操作（DELETE/DROP/TRUNCATE）を伴うタスクは存在しない（CLAUDE.md禁止事項）
- 論理的なまとまりごと、またはタスクごとにコミットする
- 各チェックポイントでストーリー単独の動作確認を止めて行うこと
