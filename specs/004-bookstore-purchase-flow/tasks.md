---
description: "Task list for オンライン書店の購買フロー"
---

# Tasks: オンライン書店の購買フロー

**Input**: Design documents from `/specs/004-bookstore-purchase-flow/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md)
**Reference**: [research.md](./research.md) / [data-model.md](./data-model.md) / [contracts/](./contracts/) / [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- ファイルパスは [plan.md](./plan.md) の Structure Decision に記載の実パスに準拠

> **構成に関する注記**: `plan.md` の Project Structure にはエラーハンドリング専用のモジュールが定義されていないため、
> エラー応答の整形（research.md D-11）は `backend/src/types/index.ts`（型・ファクトリ）と
> `backend/src/index.ts`（ハンドラ登録）に配置する。新規ディレクトリは作らない。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 雛形の取り込みと品質ツールの整備（憲法§1・§2）

- [x] T001 `origin/main` から雛形を取り込む（`git checkout origin/main -- frontend backend docker-compose.yml mysql .env.example .gitignore`）。取り込み後に `frontend/` `backend/` `mysql/init/01_init.sql` `docker-compose.yml` の存在を確認する（quickstart.md §1）
- [x] T002 `.env.example` を `.env` へコピーし、`DB_NAME` / `DB_USER` / `DB_PASSWORD` / `PORT` / `NEXT_PUBLIC_API_URL` を確認する。`.env` をコミットしない（tech-stack.md §8）
- [x] T003 [P] `backend/package.json` に `eslint` / `@typescript-eslint/parser` / `@typescript-eslint/eslint-plugin` を追加し、`backend/.eslintrc.json`（`@typescript-eslint` recommended）と `lint` スクリプトを作成する（tech-stack.md §3）
- [x] T004 [P] `frontend/package.json` に `eslint` / `eslint-config-next` を追加し、`frontend/.eslintrc.json`（`next/core-web-vitals`）と `lint` スクリプトを作成する（tech-stack.md §3）
- [x] T005 [P] `backend/package.json` に `jest` / `@types/jest` / `ts-jest` / `supertest` / `@types/supertest` を追加し、`backend/jest.config.js` を作成する。`coverageThreshold` を 80% に設定する（憲法§2 / SC-008）
- [x] T006 [P] `frontend/package.json` に `jest` / `@types/jest` / `jest-environment-jsdom` / `@testing-library/react` / `@testing-library/jest-dom` を追加し、`next/jest` を用いた `frontend/jest.config.js` を作成する。`coverageThreshold` を 80% に設定する（憲法§2 / SC-008）
- [ ] T007 `docker compose up --build` で3コンテナが起動し、`curl http://localhost:4000/health` が応答することを確認する（quickstart.md §4）

**Checkpoint**: 雛形が動作し、Lint・テストの実行基盤が整った

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全ユーザーストーリーが依存する DB スキーマ・DB 接続・共通表示部品

⚠️ **このフェーズの完了が Phase 3 以降のすべての前提**

- [ ] T008 `mysql/init/01_init.sql` の雛形（サンプル `users` テーブル）を本仕様のスキーマに置き換える。`books` / `orders` / `order_items` の3テーブルを data-model.md §3 のとおり定義する（列・型・制約・索引・外部キー）
- [ ] T009 `mysql/init/02_seed.sql` を新規作成し、書籍の初期データを投入する。**`is_available = FALSE` の書籍を1冊以上**、**`cover_image_url` が NULL の書籍を1冊以上**含める。販売状態は**初期データとしてのみ与え**、アプリケーションから変更する手段を作らない（data-model.md §6 / FR-001a, FR-001b / FR-005a の検証に必要）
- [ ] T010 `backend/src/db/pool.ts` を新規作成し、`mysql2/promise` のコネクションプールを環境変数（`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`）から生成する。接続情報をコードへ直書きしない（tech-stack.md §8）
- [ ] T011 [P] `backend/src/types/index.ts` を新規作成し、`Book` / `OrderRequest` / `OrderItemSnapshot` / `ApiError` の型と、エラー応答 `{ error: { code, message, details? } }` を生成するファクトリを定義する（contracts/README.md / research.md D-11）。`any` を使わない（tech-stack.md §8）
- [ ] T012 `backend/src/index.ts` にルータのマウント位置とエラーハンドリングミドルウェアを追加する。すべてのエラー応答を T011 のファクトリ経由に統一し、スタックトレース・SQL・接続情報を本文に含めない（contracts/README.md）
- [ ] T013 [P] `frontend/src/app/globals.css` を新規作成し、色・間隔・フォントの共有 CSS 変数を定義する。UI ライブラリ・CSS フレームワークは導入しない（research.md D-06 / 憲法§3）
- [ ] T014 [P] `frontend/src/components/ErrorNotice.tsx` を新規作成する。API のエラー応答形式を受け取り統一された見た目で表示する共通コンポーネント（FR-030 / research.md D-11）
- [ ] T015 [P] `frontend/src/components/EmptyState.tsx` を新規作成する。空状態のメッセージと導線を受け取る共通コンポーネント（FR-004 / FR-014 / 憲法§3）
- [ ] T016 `frontend/src/lib/apiClient.ts` を新規作成し、`NEXT_PUBLIC_API_URL` を基点とした API 呼び出しとエラー応答のパースを実装する（contracts/README.md）
- [ ] T017 `frontend/src/app/layout.tsx` の雛形を更新し、`globals.css` を読み込む。`lang="ja"` を維持する（WCAG 2.1 AA / 憲法§3）

**Checkpoint**: スキーマ・DB 接続・共通表示部品が揃い、ユーザーストーリーの実装を開始できる

---

## Phase 3: User Story 1 - 販売中の書籍を探して内容を確かめる (Priority: P1) 🎯 MVP

**Goal**: 商品一覧で販売中の書籍をグリッド表示し、クリックで詳細（説明文を含む）を閲覧できる

**Independent Test**: カート・注文が未実装でも、一覧に複数冊が表示され、任意の書籍をクリックして詳細へ遷移し、書影・タイトル・著者・価格・説明文が読めること

- [ ] T018 [US1] `backend/src/routes/books.ts` を新規作成し、`GET /api/books` を実装する。`WHERE is_available = TRUE` で絞り、`ORDER BY id ASC` で全件返す。0件でも 200 と空配列を返す（contracts/books-api.md / FR-001, FR-001a, FR-001c, FR-001d, FR-004）
- [ ] T019 [US1] `backend/src/routes/books.ts` に `GET /api/books/:id` を実装する。不存在・販売停止・`id` 不正のいずれも 404 `BOOK_NOT_FOUND` で統一して返す（contracts/books-api.md / FR-005, FR-005a）
- [ ] T020 [US1] `backend/src/index.ts` に books ルータをマウントする。全クエリで `mysql2` のプレースホルダを使用していることを確認する（tech-stack.md §8）
- [ ] T021 [P] [US1] `backend/tests/integration/books.test.ts` を新規作成し、supertest で一覧の絞り込み・並び順・空配列、詳細の 200／404（販売停止・不存在）を検証する（SC-015）
- [ ] T022 [P] [US1] `frontend/src/components/BookCard.tsx` を新規作成する。書影・タイトル・著者・価格を表示し、`cover_image_url` が null のときは代替表示にしてレイアウトを崩さない。**カード全体を `/books/[id]` へのリンクとし、キーボード操作でも到達・選択できるようにする**（FR-002, FR-003 / Edge Cases / 憲法§3 アクセシビリティ）
- [ ] T023 [US1] `frontend/src/app/page.tsx` の雛形を商品一覧に置き換える。`BookCard` をグリッド配置し、0件時は `EmptyState` を表示する。**書籍の取得に失敗した場合は白画面にせず `ErrorNotice` で失敗した旨と再試行の導線を表示する**。ページ送り・追加読み込みの導線を設けない（FR-001, FR-001c, FR-004, FR-030 / Edge Cases）
- [ ] T024 [US1] `frontend/src/app/books/[id]/page.tsx` を新規作成する。書影・タイトル・著者・価格・説明文を表示し、404 時は「該当の書籍が見つかりません」と商品一覧へ戻る導線を表示する。**404 以外の取得失敗は `ErrorNotice` で表示し、404 の「見つかりません」表示と区別する**（FR-005, FR-005a, FR-030 / Edge Cases）
- [ ] T025 [P] [US1] `frontend/tests/BookCard.test.tsx` を新規作成し、書影あり／なしの表示と必須項目（タイトル・著者・価格）の描画、**詳細ページへのリンク先が `/books/[id]` であること**を検証する（FR-003）

**Checkpoint**: 一覧と詳細が単独で動作し、販売停止の書籍が表示されないことを確認できる

---

## Phase 4: User Story 2 - 欲しい書籍をカートに入れて買い物を続ける (Priority: P2)

**Goal**: 商品詳細からカートに追加し、ヘッダーの件数増加で成立を確認しつつ、一覧へ戻って追加を続けられる

**Independent Test**: 詳細で「カートに追加」→ 一覧へ戻る → 別の書籍を追加、という往復でヘッダーの件数が増えること。ブラウザを閉じて再訪してもカートが復元されること

- [ ] T026 [US2] `frontend/src/lib/cartContext.tsx` を新規作成する。React Context でカート状態を保持し、`localStorage`（キー `cart`）へ同期・復元する。保存形式は `[{ bookId, quantity }]` とし、書名・価格は保存しない（research.md D-01 / data-model.md §4 / FR-016, FR-016a）
- [ ] T027 [US2] `frontend/src/lib/cartContext.tsx` に操作規則を実装する。同一書籍の再追加は既存行の数量を1加算（FR-009）、数量0で自動削除（FR-011a）、数量の上限なし（FR-011b）。`localStorage` の読み書き失敗時はメモリ上のカートとして継続する（research.md D-01 / 憲法§3）
- [ ] T028 [P] [US2] `frontend/tests/cartContext.test.tsx` を新規作成し、再追加での数量加算・数量0での自動削除・上限なし・復元・保存失敗時の継続を検証する（SC-010, SC-011 / SC-008 の対象）
- [ ] T029 [US2] `frontend/src/components/Header.tsx` を新規作成する。全画面共通のヘッダーとしてカート画面への導線と件数を表示する。件数は**数量の合計**（行数ではない）とし、0件のときも分かる表示にする（FR-032, FR-033, FR-035）
- [ ] T030 [US2] `frontend/src/app/layout.tsx` に `CartProvider` と `Header` を組み込み、5画面すべてに行き渡らせる。カート変更時に件数が画面遷移なしで更新されることを確認する（FR-032, FR-034）
- [ ] T031 [US2] `frontend/src/app/books/[id]/page.tsx` に「カートに追加」ボタンと「一覧へ戻る」導線を追加する。数量指定などの追加入力を求めない（FR-006, FR-007, FR-008）
- [ ] T032 [P] [US2] `frontend/tests/Header.test.tsx` を新規作成し、件数が数量の合計と一致すること・カート変更で更新されることを検証する（SC-014）

**Checkpoint**: カートへの追加・保持・復元とヘッダー件数が動作する

---

## Phase 5: User Story 3 - カートの中身を調整して合計金額を把握する (Priority: P3)

**Goal**: カート画面で書名・単価・数量・小計を確認し、数量増減・削除に応じて合計が即時更新される

**Independent Test**: 複数冊を入れた状態から数量増減・削除を行い、小計・合計が期待値どおりに更新されること

- [ ] T033 [P] [US3] `frontend/src/lib/calcCartTotal.ts` を新規作成する。小計（`price × quantity`）と合計（小計の総和）を算出する純関数。送料・手数料・割引を含めない（FR-010, FR-013 / research.md D-10）
- [ ] T034 [P] [US3] `frontend/tests/calcCartTotal.test.ts` を新規作成し、単一・複数・0件・大きな数量の各ケースで金額が整数演算どおりに一致することを検証する（SC-003 / SC-008 の対象）
- [ ] T035 [US3] `frontend/src/components/CartSummary.tsx` を新規作成する。書名・単価・数量・小計と合計金額を表示する共通コンポーネント。**数量の増減・削除の操作要素を表示するかどうかを切り替えられるようにし、カート画面では操作あり・注文フォーム画面では表示のみで用いる**（FR-010, FR-013, FR-021）
- [ ] T036 [US3] `frontend/src/app/cart/page.tsx` を新規作成する。書名・単価・数量・小計の一覧と合計金額の表示に `CartSummary` を用い、数量の増減・明示的な削除の操作を同画面に実装する。0件時は `EmptyState` と商品一覧への導線を表示する。**書籍情報の取得に失敗した場合は `ErrorNotice` を表示し、カートの中身を失わせない**。0件では注文手続きへ進ませない（FR-010, FR-011, FR-012, FR-013, FR-014, FR-030）
- [ ] T037 [US3] `frontend/src/app/cart/page.tsx` に「注文手続きへ」ボタンを実装し、1冊以上のときのみ `/checkout` へ遷移させる（FR-015）
- [ ] T038 [US3] `frontend/src/app/cart/page.tsx` で `GET /api/books` の結果とカートを突き合わせ、販売停止・削除された書籍を特定できる形で提示し、カートから取り除く導線を示す（FR-016b）
- [ ] T039 [P] [US3] `frontend/tests/cartPage.test.tsx` を新規作成し、数量増減・削除での合計の即時更新、0件時の空状態、販売停止書籍の提示を検証する

**Checkpoint**: カートの調整と金額計算が完結し、注文フォームへ進める

---

## Phase 6: User Story 4 - 注文情報を入力して注文を確定し、完了を確認する (Priority: P4)

**Goal**: 注文フォームで顧客情報を入力し、同一画面で注文内容を確認して注文を確定、注文完了画面で注文番号を確認できる

**Independent Test**: 未入力・形式不正でのエラー表示、正常入力での確定、注文完了画面の表示内容、再読込時の挙動までを一連で検証できる

### バックエンド：ドメインロジック（単体テスト対象・SC-008）

- [ ] T040 [P] [US4] `backend/src/domain/generateOrderNumber.ts` を新規作成する。ULID 形式（Crockford Base32・26文字）を `crypto.randomBytes` で生成する。先頭48ビットがミリ秒タイムスタンプ、残り80ビットが乱数。**`ulid` パッケージを追加しない**（FR-023 / research.md D-03 / tech-stack.md §6）
- [ ] T041 [P] [US4] `backend/tests/unit/generateOrderNumber.test.ts` を新規作成し、長さ26文字・文字種・大量生成時の重複なし・時刻順の単調性を検証する（SC-005）
- [ ] T042 [P] [US4] `backend/src/domain/validateOrderRequest.ts` を新規作成する。氏名（1〜100）・住所（1〜255）・メール（1〜255・形式）の必須検証、明細の1件以上・数量1以上の整数・`bookId` 重複なしを検証し、`details.fields` 形式の結果を返す（contracts/orders-api.md / FR-017〜FR-020）
- [ ] T043 [P] [US4] `backend/tests/unit/validateOrderRequest.test.ts` を新規作成し、各項目の未入力・空白のみ・最大長超過・メール形式不正・明細0件・数量不正・`bookId` 重複を検証する（SC-004）
- [ ] T044 [P] [US4] `backend/src/domain/calcOrderTotal.ts` を新規作成する。`books.price` と数量から小計・合計を算出する純関数。**クライアントから送られた金額を使わない**（contracts/orders-api.md / FR-024 / research.md D-10）
- [ ] T045 [P] [US4] `backend/tests/unit/calcOrderTotal.test.ts` を新規作成し、単一・複数明細で合計が小計の総和と一致することを検証する（SC-003）

### バックエンド：注文作成 API

- [ ] T046 [US4] `backend/src/services/orderService.ts` を新規作成する。対象書籍の実在・販売状態を確認し（FR-016b）、サーバ側で金額を算出し、注文を一意に特定できる注文番号を発行し、`orders` INSERT → `order_items` INSERT → COMMIT を**単一トランザクション**で実行する。失敗時は ROLLBACK する（FR-023, FR-024, FR-025, FR-026 / research.md D-08）
- [ ] T047 [US4] `backend/src/services/orderService.ts` で `order_items` に注文時点の `title` / `unit_price` / `subtotal` を**値としてコピー**する。以後の `books` の変更に影響されないようにする（FR-024 / data-model.md §3.3）
- [ ] T048 [US4] `backend/src/routes/orders.ts` を新規作成し、`POST /api/orders` を実装する。201（`orderNumber` / `totalAmount` / `items`）、400 `VALIDATION_ERROR`、409 `BOOKS_UNAVAILABLE`、500 `INTERNAL_ERROR` を contracts/orders-api.md のとおり返す。**`orders.id` を応答に含めない**（FR-029b）
- [ ] T049 [US4] `backend/src/index.ts` に orders ルータをマウントする
- [ ] T050 [P] [US4] `backend/tests/integration/orders.test.ts` を新規作成し、正常系（201・スナップショット保存）、400（各バリデーション）、409（販売停止の書籍を含む）、金額改ざん（送信値を無視しサーバ算出値を使う）を検証する（SC-004, SC-005, SC-006）

### フロントエンド：注文フォーム・注文完了

- [ ] T051 [P] [US4] `frontend/src/lib/validateOrderForm.ts` を新規作成する。T042 と**同一の規則**を実装する（contracts/orders-api.md 末尾 / FR-018〜FR-020）
- [ ] T052 [P] [US4] `frontend/tests/validateOrderForm.test.ts` を新規作成し、T043 と同じケースで結果が一致することを検証する（SC-004 / SC-008 の対象）
- [ ] T053 [US4] `frontend/src/app/checkout/page.tsx` を新規作成する。氏名・住所・メールの入力欄と `CartSummary` を**同一画面**に配置する（別の確認画面を挟まない）。**カートが0件の場合（URL 直接アクセス・注文確定後の戻る操作を含む）はフォームを表示せず、`EmptyState` でカートが空である旨とカート／商品一覧への導線を示し、注文を確定させない**（FR-014, FR-017, FR-021 / Edge Cases）
- [ ] T054 [US4] `frontend/src/app/checkout/page.tsx` にバリデーションとエラー表示を実装する。エラー時は注文を確定させず、入力済みの内容を失わせない（FR-018, FR-019, FR-020）
- [ ] T055 [US4] `frontend/src/app/checkout/page.tsx` に「注文する」の送信処理を実装する。送信中はボタンを `disabled` にして二重送信を防ぐ（FR-022, FR-025 / research.md D-08）
- [ ] T056 [US4] 注文成功時（201）のみカートを空にし、`localStorage` からも削除する。失敗時はカートと入力内容を保持する（FR-022a, FR-022b, FR-026）
- [ ] T057 [US4] 注文成功時の応答（`orderNumber` / `totalAmount` / `items`）を `sessionStorage` に一時保存し、`/order-complete` へ遷移する。**URL に注文番号を含めない**（FR-029b / research.md D-02）
- [ ] T058 [US4] `frontend/src/app/order-complete/page.tsx` を新規作成する。マウント時に `sessionStorage` から読み出して**即座に削除**し、完了メッセージ・注文番号・商品一覧へ戻るリンクを表示する（FR-027, FR-028, FR-029）
- [ ] T059 [US4] `frontend/src/app/order-complete/page.tsx` で、読み出せなかった場合（再読込・直接アクセス・ブックマークからの再訪）は注文情報を表示せず商品一覧への導線のみを表示する。注文番号が再表示できない旨を画面上で伝える（FR-029a, FR-029c）
- [ ] T060 [US4] `frontend/src/app/checkout/page.tsx` で 409 `BOOKS_UNAVAILABLE` を受けた場合、該当書籍を特定できる形で提示し、注文完了画面へ遷移させない（FR-016b, FR-026）
- [ ] T061 [P] [US4] `frontend/tests/checkout.test.tsx` と `frontend/tests/orderComplete.test.tsx` を新規作成し、バリデーションエラー時に遷移しないこと、成功時にカートが空になること、**カート0件で注文フォームを開いた場合にフォームが表示されないこと**、再読込相当で注文情報が表示されないことを検証する（SC-012, SC-013）

**Checkpoint**: 購買フローが端から端まで通り、requirements.md §8 の受け入れ基準を満たす

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T062 `cd backend && npm run lint` と `cd frontend && npm run lint` を実行し、**エラー0件**にする（憲法§1）
- [ ] T063 `npm test -- --coverage` を両方で実行し、カバレッジ**80%以上**を満たす（憲法§2 / SC-008）
- [ ] T064 [P] `any` の不使用、`mysql2` プレースホルダの使用、接続情報の直書きなし、アプリコードからの破壊的 DDL なしを確認する（tech-stack.md §8）
- [ ] T065 [P] スコープ外機能（ログイン・決済・在庫・管理画面・レビュー・検索／フィルター・送料計算）が実装されていないこと、および**販売状態を変更する画面・API・操作が存在しない**ことを確認する（FR-001b, FR-031 / tech-stack.md §9）
- [ ] T066 [P] 全画面でエラー表示・空状態表示・画面遷移の扱いが統一されていることを確認する（FR-030 / SC-009 / 憲法§3）
- [ ] T067 [P] アクセシビリティを確認する（見出し階層、フォームのラベル関連付け、画像の代替テキスト、キーボード操作、コントラスト比）。WCAG 2.1 AA を目標とする（憲法§3）
- [ ] T068 [quickstart.md](./quickstart.md) §6 の受け入れ確認をすべて実施する。特に Clarification で決めた9項目（再追加での数量加算・再訪での復元・数量0での削除・件数＝数量合計・確定後のカート0件・再読込での非表示・URL に注文番号なし・販売停止書籍の非表示・価格変更後も注文金額不変）を確認する
- [ ] T069 価格変更後も確定済み注文の金額が変わらないことを実データで確認する（`UPDATE books SET price = ...` 後に `order_items.unit_price` を確認・SC-006）
- [ ] T070 [P] 主要5画面の表示と主要操作（一覧取得・詳細取得・カート更新・注文確定）の応答時間を計測し、**95パーセンタイルで2秒以内**を満たすことを確認する。ブラウザの開発者ツール（Network / Performance）で各20回試行し、結果を `docs/reviews/` の承認記録に添付する（憲法§4 / SC-007）

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001-T007)
   ↓
Phase 2: Foundational (T008-T017)  ← 全ストーリーをブロック
   ↓
Phase 3: US1 (T018-T025) 🎯 MVP
   ↓
Phase 4: US2 (T026-T032)  ← US1 の詳細画面に依存
   ↓
Phase 5: US3 (T033-T039)  ← US2 のカート状態に依存
   ↓
Phase 6: US4 (T040-T061)  ← US3 のカート内容に依存
   ↓
Phase 7: Polish (T062-T070)
```

### ストーリー間の依存

spec.md の記載どおり、本フィーチャーのユーザーストーリーは**購買導線上の依存関係**を持つ（前段が成立しないと後段を検証できない）。そのため US1〜US4 は並行実行できず、順に実装する。

| ストーリー | 依存 | 理由 |
|---|---|---|
| US1 | Foundational | 一覧・詳細は書籍データのみに依存 |
| US2 | US1 | 「カートに追加」は商品詳細画面に置かれる（FR-006） |
| US3 | US2 | カート画面はカート状態（US2）を表示する |
| US4 | US3 | 注文フォームはカート内容と合計（US3）を表示する（FR-021） |

**ただし US4 のバックエンド（T040〜T050）は US1 完了後に着手可能**。フロントの US2・US3 と並行して進められる。

### 並行実行の機会

| フェーズ | 並行可能なタスク | 本数 |
|---|---|---|
| Phase 1 | T003, T004, T005, T006 | 4 |
| Phase 2 | T011, T013, T014, T015 | 4 |
| Phase 3 | T021, T022, T025 | 3 |
| Phase 4 | T028, T032 | 2 |
| Phase 5 | T033, T034, T039 | 3 |
| Phase 6 | T040〜T045（ドメイン6本）, T050, T051, T052, T061 | 10 |
| Phase 7 | T064, T065, T066, T067, T070 | 5 |

---

## MVP スコープ

**最小の価値ある単位**: Phase 1 + Phase 2 + Phase 3（US1）＝ **T001〜T025（25タスク）**

この時点で「販売中の書籍を一覧で眺め、詳細を読める」というカタログ閲覧の価値が単独で成立する（REQ-001〜REQ-004）。

要件定義書 §8 の受け入れ基準をすべて満たすには **Phase 6 までの完了（T001〜T061）** が必要。

---

## Notes

- `[P]` は別ファイル・依存なしで並行実行できるタスク
- `[Story]` ラベルは spec.md のユーザーストーリーに対応
- タスクごと、または論理的なまとまりごとにコミットする
- **T001 は必須の前提**。本ブランチには雛形が存在しないため、これを飛ばすと以降のすべてのタスクが着手できない
- 憲法§6（ウォーターフォール運用）に従う場合、Phase 6 完了後に `/speckit.testplan` → `/speckit.review` でテストフェーズの承認を得る
