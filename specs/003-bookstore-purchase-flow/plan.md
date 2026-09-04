# Implementation Plan: 個人運営オンライン書店 購買フロー

**Branch**: `003-bookstore-purchase-flow` | **Date**: 2026-09-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-bookstore-purchase-flow/spec.md`
**Tech Stack**: Defined in [`tech-stack.md`](../../tech-stack.md) (do NOT re-select here)

## Summary

未ログインの購入希望者が「商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了」の5画面で書籍を注文できる購買フロー。フロントエンド（Next.js）が5画面と画面遷移・カート（ブラウザ保持）を担い、バックエンド（Express REST API）が書籍カタログの提供と注文の永続化を担う。データは MySQL に保存する。決済・会員管理・在庫管理・管理画面・レビュー・検索/フィルターはスコープ外。

技術アプローチ（詳細は [research.md](research.md)）:

- **カートはサーバに持たず**フロントエンドの `localStorage` で保持（CL-001）。バックエンドはカート API を持たない
- 書籍一覧は**ページング API**（`GET /api/books?page=&pageSize=`）。既定 12件/ページ（CL-006）
- 注文作成時にバックエンドで**サーバ側再計算・再バリデーション**を行い、`order_items` に**注文時点の書名・単価をスナップショット保存**（CL-005）
- **注文番号**は時刻順ソート可能で衝突耐性のある一意トークン（`ORD-` + ULID 由来の Crockford Base32、CL-003）
- API 失敗時はフロントで**汎用エラー表示のみ**（CL-007）

## Technical Context

**Language/Version**: TypeScript 5.x（フロント・バック共通） / Node.js 20 LTS
**Primary Dependencies**:
- フロント: Next.js 14.2.3（App Router）、React 18、React DOM 18
- バック: Express 4.18、mysql2 3.6（プレースホルダ必須）、cors 2.8
- 開発時: `next dev` / `ts-node-dev`（`tech-stack.md` §2）
**Storage**: MySQL 8.0（`books` / `orders` / `order_items`）。カートは非永続（クライアント `localStorage`）
**Testing**: Jest（`next/jest` でフロント、`ts-jest` でバック）＋ Supertest（API 結合）＋ @testing-library/react。カバレッジ目標 80%（憲法 §2）
　→ `tech-stack.md` §3 は「Vitest または Jest」で未確定。本計画では **Jest** を採用案として提示。**人間が `tech-stack.md` に追記して確定すること**（[research.md](research.md) D-07）
**Target Platform**: ローカルの Docker Compose（frontend :3000 / backend :4000 / mysql :3306）。対応ブラウザはモダンブラウザ最新版
**Project Type**: Web application（frontend + backend の2プロジェクト構成）
**Performance Goals**: 要件定義書で数値目標なし（学習・デモ）。憲法 §4 の暫定基準「主要画面/API 95パーセンタイルで2秒以内」を上限の目安とする
**Constraints**:
- Docker Compose 構成で動作（`requirements.md` §5）
- ポート固定: front 3000 / back 4000 / MySQL 3306
- 認証情報・接続情報は `.env` / 環境変数のみ（コード直書き禁止）
- 破壊的 DDL をアプリコードから発行しない（憲法 §1）
- SQL はプレースホルダ必須（`tech-stack.md` §8）
**Scale/Scope**: ローカル単一利用者。書籍カタログは数十〜数百件想定（ページングで対応）。同時実行・高負荷は考慮しない

## Constitution Check

*GATE: Phase 0 research の前に通過必須。Phase 1 design 後に再チェック。*

| 憲法原則 | ゲート | 判定 | 根拠 |
|---|---|---|---|
| §1 コード品質 | ESLint エラー0件を必須。破壊的 DDL 禁止 | ✅ PASS | フロント・バックとも ESLint 設定を用意（`next lint` / `@typescript-eslint`）。DDL はマイグレーション用 SQL のみで `DROP`/`TRUNCATE` を生成しない。`.github/workflows/quality-gate.yml` と整合 |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト。カバレッジ未定義なら80% | ✅ PASS | カート合計計算・注文バリデーション・注文番号生成・スナップショット化を単体テスト対象に設定。結合テストは注文作成 API（重要度=高）に実施。目標カバレッジ80% |
| §3 UX一貫性 | CSS/デザインシステムに準拠。未定義ならブラウザ既定で統一。画面遷移・エラー・空状態を全画面統一。WCAG 2.1 AA 目標 | ⚠️ PASS（前提付き） | `tech-stack.md` に UI フレームワーク・CSS 方針の記載なし → 憲法 §3 のフォールバックに従い、UI ライブラリを導入せず CSS Modules ＋共有スタイルで統一（[research.md](research.md) D-06）。エラー/空状態の共通コンポーネントを用意（FR-027）。**CSS 方針を `tech-stack.md` に明文化することを推奨** |
| §4 パフォーマンス | 主要画面/API の応答時間を要件定義書で定義。未定義なら95p2秒 | ✅ PASS | 数値目標なし。憲法フォールバックを目安として採用。ページングで一覧の応答を一定に保つ |
| §5 技術的意思決定 | 使用技術は `tech-stack.md` で人間が確定。新規依存は理由明記。**`tech-stack.md` は人間のみ編集** | ⚠️ 要対応（実装前ゲート） | 本体依存（Next/React/Express/mysql2/cors/MySQL）は `tech-stack.md` 記載どおりで追加なし。注文番号も自前実装で外部依存を足さない。ただし**テスト・Lint 用の開発依存が `tech-stack.md` 未記載**（jest, ts-jest, @types/jest, supertest, @testing-library/react, eslint 関連）。AI は `tech-stack.md` を編集しないため、**人間が §2/§3 に追記して確定**する必要あり（下記 Complexity Tracking →「実装前ゲート」参照） |
| §6 開発方法論 | ウォーターフォール運用ならフェーズゲート承認 | ✅ PASS（運用） | 本計画は `/speckit.specify`→`/speckit.plan`→`/speckit.tasks`→`/speckit.implement` の順で進行中。各フェーズで `/speckit.review` の承認を人間が行う前提 |
| §7 設計ルール | 基本/詳細設計書・テーブル定義書は HTML ベース | ✅ 該当時対応 | 本計画完了後に `/speckit.design basic|detail|table` で生成（設計フェーズの後半） |

**結論**: Phase 0 research に進んでよい。ただし §5 について「開発依存の `tech-stack.md` への追記・確定」は**人間の対応事項**として残す（実装フェーズ開始前に解消すること）。

## Project Structure

### Documentation (this feature)

```text
specs/003-bookstore-purchase-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── README.md
│   ├── books-list.md
│   ├── books-detail.md
│   └── orders-create.md
└── tasks.md             # Phase 2 output（/speckit.tasks で生成）
```

### Source Code (repository root)

Web application（frontend + backend）構成を採用。main ブランチに既に存在する雛形実装（`frontend/` `backend/` `docker-compose.yml` `mysql/`）を土台にする。

```text
backend/
├── src/
│   ├── index.ts                  # Express エントリ（既存）
│   ├── app.ts                    # ルーティング組み立て
│   ├── config/
│   │   └── db.ts                 # mysql2 プール（環境変数から）
│   ├── routes/
│   │   ├── books.ts              # GET /api/books, GET /api/books/:id
│   │   └── orders.ts             # POST /api/orders,（補助）GET /api/orders/:orderNumber
│   ├── services/
│   │   ├── bookService.ts        # カタログ取得（ページング）
│   │   └── orderService.ts       # 注文作成（再計算・スナップショット・注文番号発行）
│   ├── domain/
│   │   ├── orderNumber.ts        # 注文番号生成（ULID→Base32）
│   │   ├── pricing.ts            # 小計・合計の算出
│   │   └── orderValidation.ts    # 氏名・住所・メール・明細の検証
│   └── repositories/
│       ├── bookRepository.ts     # books テーブル
│       └── orderRepository.ts    # orders / order_items（トランザクション）
└── tests/
    ├── unit/                     # pricing / orderValidation / orderNumber
    └── integration/              # orders-create.test.ts（Supertest）

frontend/
├── app/
│   ├── layout.tsx                # 共通レイアウト（ヘッダ: 一覧/カートへの導線）
│   ├── page.tsx                  # 画面1: 商品一覧（?page= でページング）
│   ├── books/[id]/page.tsx       # 画面2: 商品詳細
│   ├── cart/page.tsx             # 画面3: カート
│   ├── checkout/page.tsx         # 画面4: 注文フォーム
│   └── order-complete/page.tsx   # 画面5: 注文完了（注文番号表示）
├── components/
│   ├── BookCard.tsx
│   ├── BookGrid.tsx
│   ├── Pagination.tsx
│   ├── OrderSummary.tsx          # カート行＋合計（カート画面・注文フォームで共用）
│   ├── QuantityStepper.tsx       # 数量増減（US2）
│   ├── CheckoutForm.tsx
│   ├── ErrorNotice.tsx           # 汎用エラー表示（FR-032）
│   └── EmptyState.tsx            # 空状態の共通表示（FR-004, FR-016, FR-027）
├── lib/
│   ├── api.ts                    # バックエンド REST クライアント
│   ├── cart.ts                   # localStorage カート: readCart/addItem(+1)/clear（US1）＋ setQuantity/removeItem（US2）
│   ├── cartTotal.ts              # 小計・合計の算出（テスト対象、バックと同一ロジック）
│   └── validation.ts            # 入力バリデーション（送信時、テスト対象）
└── tests/
    ├── unit/                     # cart / cartTotal / validation
    └── components/               # CheckoutForm など（@testing-library/react）

mysql/
└── init/
    ├── 001_schema.sql            # books / orders / order_items の CREATE
    └── 002_seed_books.sql        # デモ用書籍データ
```

**Structure Decision**: plan-template の Option 2（Web application: frontend + backend）を採用。既存の `frontend/` `backend/` `mysql/` `docker-compose.yml` に合わせ、バックは routes / services / domain / repositories の層に分割、フロントは App Router のページ単位＋再利用コンポーネント＋`lib/` に純粋ロジックを寄せる（テスト容易性のため）。

## Complexity Tracking

> Constitution Check の §5 に「人間の対応事項」が残るため記録する。設計上の逸脱ではなく、雛形運用ルール（`tech-stack.md` は人間が編集）に起因する。

| 項目 | 現状 / 必要理由 | 人間が行う対応 |
|---|---|---|
| テスト用開発依存が `tech-stack.md` 未記載 | 憲法 §2 が単体テスト必須。実行には jest / ts-jest / @types/jest / supertest / @types/supertest / @testing-library/react / @testing-library/jest-dom / jest-environment-jsdom が必要 | 担当者が `tech-stack.md` §3 に「テストフレームワーク = Jest」および上記 devDependencies を追記し確定（AI は編集不可） |
| Lint 用開発依存が `tech-stack.md` 未記載 | 憲法 §1・`quality-gate.yml` が ESLint 前提。`eslint` / `@typescript-eslint/parser` / `@typescript-eslint/eslint-plugin` / `eslint-config-next` が必要 | 担当者が `tech-stack.md` §3 に対象パッケージと設定ファイル名（`backend/.eslintrc.json` / `frontend/.eslintrc.json`）を明記 |
| CSS 方針が未定義 | 憲法 §3 は未定義時ブラウザ既定で統一を要求。本計画は UI ライブラリ不使用＋CSS Modules＋`globals.css` の共有変数で対応（research D-06） | 担当者が `tech-stack.md` §3 か新項目に CSS 方針（UI ライブラリ不使用／CSS Modules／共有 CSS 変数）を明文化 |
| `quality-gate.yml` はルート `package.json` を前提 | 実体は `frontend/` `backend/` に分離。ルート `package.json` が無いと Lint が走らずフェイルセーフで赤 | **解決済み（2026-09-04、方針B）**: `.github/workflows/quality-gate.yml` を frontend/backend 個別の `hashFiles` 判定＋`working-directory` で `npm ci && npm run lint` する構成に改変。フェイルセーフの `if` 条件にも両 `package.json` を追加。実装時に `frontend/backend` 双方へ `lint` スクリプトを用意すること（T003/T002） |

### ⛔ 実装前ゲート（`/speckit.implement` 着手前に完了させること）

| # | 内容 | 状態 |
|---|---|---|
| 1 | `tech-stack.md` §2/§3 に **テストFW = Jest** と test/lint devDependencies を追記（理由: [research.md](research.md) D-07） | ✅ 2026-09-04 AI 代行記入済み（人間の最終確認待ち） |
| 2 | `tech-stack.md` §2/§3 に **CSS 方針**（UI ライブラリ不使用／CSS Modules／共有変数）を明記（理由: [research.md](research.md) D-06） | ✅ 2026-09-04 AI 代行記入済み（人間の最終確認待ち） |
| 3 | `tech-stack.md` §6「却下した選択肢」に **Vitest** / **`ulid` パッケージ** / **CSS フレームワーク** を追記 | ✅ 2026-09-04 AI 代行記入済み（人間の最終確認待ち） |
| 4 | ルート `package.json` 集約 or `quality-gate.yml` 調整の方針決定（T054 に反映） | ✅ 2026-09-04 方針B：`quality-gate.yml` を frontend/backend 分離向けに改変済み |
| 5 | `/speckit.review` で要件定義・設計フェーズを承認（`docs/reviews/` に記録） | 🔄 記録を下書き生成（署名は人間） |
| 6 | ウォーターフォール運用なら `/speckit.design basic\|detail\|table`（HTMLベース設計書）を生成（憲法§7 / A4） | ✅ 2026-09-04 生成済み（basic/detail/table、承認欄未記入） |

> 項目 1〜3 は憲法§5 上「人間が `tech-stack.md` に書く」ことが本来の形。2026-09-04 にユーザーのチャット指示で AI が代行記入し、その旨を `tech-stack.md` 冒頭に明記した。**担当者の最終確認・確定が必要。**
