# Implementation Plan: オンライン書店の購買フロー

**Branch**: `004-bookstore-purchase-flow` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-bookstore-purchase-flow/spec.md`
**Tech Stack**: Defined in [`tech-stack.md`](../../tech-stack.md) (do NOT re-select here)

## Summary

未ログインの購入希望者が「商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了」を、会員登録・決済なしで通せる購買フローを実装する（REQ-001〜REQ-018 / FR-001〜FR-035）。

技術的アプローチは `tech-stack.md` で確定済みの構成に従う。バックエンド（Express + mysql2）が書籍参照と注文作成の REST API を提供し、フロントエンド（Next.js App Router）が5画面を描画する。カートはサーバに持たせず、ブラウザ内に永続化して同一ブラウザでの再訪時に復元する（FR-016）。注文確定時は、注文時点の書名・単価・数量をスナップショットとして `order_items` に保存し、以後の書籍情報の変更から独立させる（FR-024）。

**前提（ユーザー承認済み・2026-09-15）**: 本ブランチには `frontend/` `backend/` `docker-compose.yml` `mysql/` `.env.example` `.gitignore` が存在しない。`origin/main` の雛形を本ブランチへ取り込んだうえで実装する（案A）。取り込みコマンドは [quickstart.md](./quickstart.md) §1 に記載。

## Technical Context

> `tech-stack.md` から転記。同文書に記載のない項目のみ NEEDS CLARIFICATION とする。

**Language/Version**: TypeScript 5.x（フロント・バック共通） / Node.js 20 LTS
**Primary Dependencies**: Next.js 14.2.3・React 18（フロント） / Express 4.18・mysql2 3.6.x・cors 2.8.x（バック） / ts-node-dev 2.0.x（開発時）
**Storage**: MySQL 8.0（`mysql2` の生 SQL、ORM 不使用）。カートのみブラウザ内に保持しサーバに永続化しない
**Testing**: Jest 29.x（`ts-jest` / `next/jest`）。バックは `supertest`、フロントは `@testing-library/react`。カバレッジ目標 80%
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306）。ローカル環境・単一利用者
**Project Type**: web application（frontend + backend の2プロジェクト構成）
**Performance Goals**: 95パーセンタイルで2秒以内（憲法§4 暫定基準 / SC-007）。学習・デモ用途のため個別の数値目標は設けない
**Constraints**: REST API でフロント⇔バック連携。書籍・注文は MySQL に永続化。外部サービス連携（決済・認証・メール送信）なし。接続情報は `.env` 経由のみ（コード直書き禁止）
**Scale/Scope**: 5画面・REST API 3本・テーブル3本。書籍は全件1画面表示が成立する規模（十数冊程度・FR-001c / Assumptions）

**未解決項目**: なし（Phase 0 の research.md で D-01〜D-11 として解決済み）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | 憲法の条項 | ゲート判定 | 根拠・対応 |
|---|---|---|---|
| §1 | Lint エラー0件を必須 | ⚠️ **要対応**（設計で担保） | 雛形の `frontend/package.json` `backend/package.json` に ESLint の依存・`lint` スクリプト・設定ファイルが**未整備**。`tech-stack.md` §3 が指定する構成（`eslint-config-next` / `@typescript-eslint`）をタスクとして追加する。新規の技術選定ではない |
| §2 | 主要ビジネスロジックに単体テスト・カバレッジ80% | ⚠️ **要対応**（設計で担保） | 雛形に Jest 未導入。`tech-stack.md` §3 が指定する依存・`coverageThreshold` をタスクとして追加する。対象は合計計算・バリデーション・注文番号生成・スナップショット化（SC-008） |
| §3 | UI は技術選定書のデザイン方針に準拠。画面遷移・エラー表示・空状態を統一。WCAG 2.1 AA | ✅ PASS | `tech-stack.md` §3 の CSS Modules ＋ `globals.css` 共有変数方針に従う（research.md D-06）。`ErrorNotice` / `EmptyState` を共通コンポーネント化（FR-030）。空状態は FR-004 / FR-014 で要件化済み |
| §4 | 性能は要件定義書に従う（未定義なら95p 2秒） | ✅ PASS | SC-007 として仕様に明記済み。全件表示でも成立する書籍数を前提とする（FR-001c） |
| §5 | 技術は `tech-stack.md` で人間が確定。plan で選び直さない | ✅ PASS | 本計画では技術を選定していない。research.md の各決定は `tech-stack.md` の記載を具体化したもので、同文書にない新規ライブラリは追加しない（D-03 のとおり `ulid` 等の新規依存も追加しない） |
| §5 | `tech-stack.md` の記入・変更は人間のみ | ⚠️ **人間の確認待ち** | 2026-09-04 および 2026-09-15 に、ユーザーの明示指示による AI 代行編集が行われ、同ファイル冒頭に例外として記録済み。**担当者の確認・確定が未了**。`/speckit.review` の実装フェーズ承認までに確定させること |
| §6 | ウォーターフォール運用時はフェーズ承認ゲートを設ける | ✅ PASS | `/speckit.design` → `/speckit.review` を Phase 1 の後段に置く（下記 Phase 2 予定） |
| §7 | 基本設計書・詳細設計書・テーブル定義書を HTML ベースで作成 | ⏭️ **後続フェーズ** | `/speckit.design` の責務。本計画の `data-model.md` / `contracts/` はその入力となる中間成果物であり、憲法§7 の正式成果物を置き換えない |
| §8（tech-stack） | `any` 禁止・プレースホルダ必須・接続情報の直書き禁止・破壊的 DDL 禁止 | ✅ PASS | `mysql2` のプレースホルダを全クエリで使用（data-model.md §5）。スキーマは `mysql/init/` の初期化 SQL のみで定義し、アプリコードから DDL を発行しない |
| §9（tech-stack） | スコープ外機能の実装禁止 | ✅ PASS | FR-031 として仕様に明記済み。API は書籍参照と注文作成のみ |

**判定**: ゲート違反なし。§1 / §2 は「雛形に未整備」という**着手前の状態**であり、実装タスクで解消する前提で PASS 扱いとする（Complexity Tracking への記載は不要）。§5 の tech-stack.md 確定のみ**人間の対応が必要**。

## Project Structure

### Documentation (this feature)

```text
specs/004-bookstore-purchase-flow/
├── plan.md              # This file
├── spec.md              # /speckit.specify + /speckit.clarify の成果物
├── research.md          # Phase 0 output（D-01〜D-11）
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── README.md
│   ├── books-api.md
│   └── orders-api.md
└── tasks.md             # Phase 2 output（/speckit.tasks）
```

### Source Code (repository root)

**Option 2: Web application (frontend + backend)** を採用。`origin/main` の雛形が既にこの形（`frontend/` + `backend/` + `mysql/` + `docker-compose.yml`）であるため。

```text
backend/
├── src/
│   ├── index.ts                    # 既存（雛形）: Express 起動・CORS・/health
│   ├── db/
│   │   └── pool.ts                 # 新規: mysql2 コネクションプール（.env から接続情報）
│   ├── routes/
│   │   ├── books.ts                # 新規: GET /api/books, GET /api/books/:id
│   │   └── orders.ts               # 新規: POST /api/orders
│   ├── services/
│   │   └── orderService.ts         # 新規: 注文作成のトランザクション制御
│   ├── domain/
│   │   ├── calcOrderTotal.ts       # 新規: 合計金額算出（単体テスト対象）
│   │   ├── validateOrderRequest.ts # 新規: 入力バリデーション（単体テスト対象）
│   │   └── generateOrderNumber.ts  # 新規: 注文番号生成（単体テスト対象）
│   └── types/
│       └── index.ts                # 新規: Book / OrderRequest 等の型
├── tests/
│   ├── unit/                       # domain/ の単体テスト
│   └── integration/                # supertest による API 結合テスト
├── .eslintrc.json                  # 新規（憲法§1）
├── jest.config.js                  # 新規（憲法§2）
├── Dockerfile                      # 既存（雛形）
├── package.json                    # 既存（雛形）＋ ESLint / Jest 依存を追加
└── tsconfig.json                   # 既存（雛形）

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 既存（雛形）→ 共通ヘッダー・CartProvider を追加
│   │   ├── globals.css             # 新規: 共有 CSS 変数（色・間隔・フォント）
│   │   ├── page.tsx                # 既存（雛形）→ 商品一覧に置き換え
│   │   ├── books/[id]/page.tsx     # 新規: 商品詳細
│   │   ├── cart/page.tsx           # 新規: カート
│   │   ├── checkout/page.tsx       # 新規: 注文フォーム
│   │   └── order-complete/page.tsx # 新規: 注文完了
│   ├── components/
│   │   ├── Header.tsx              # 新規: 全画面共通ヘッダー・カート件数（FR-032〜035）
│   │   ├── BookCard.tsx            # 新規: 一覧のカード
│   │   ├── CartSummary.tsx         # 新規: 注文内容と合計（カート・注文フォームで共用）
│   │   ├── ErrorNotice.tsx         # 新規: 共通エラー表示（FR-030）
│   │   └── EmptyState.tsx          # 新規: 共通空状態表示（FR-004 / FR-014）
│   └── lib/
│       ├── cartContext.tsx         # 新規: カート状態 ＋ localStorage 永続化（FR-016）
│       ├── calcCartTotal.ts        # 新規: 小計・合計算出（単体テスト対象）
│       ├── validateOrderForm.ts    # 新規: フォーム検証（単体テスト対象）
│       └── apiClient.ts            # 新規: バックエンド API 呼び出し
├── tests/                          # @testing-library/react による単体テスト
├── .eslintrc.json                  # 新規（憲法§1）
├── jest.config.js                  # 新規（憲法§2 / next/jest）
├── Dockerfile                      # 既存（雛形）
├── package.json                    # 既存（雛形）＋ ESLint / Jest 依存を追加
└── tsconfig.json                   # 既存（雛形）

mysql/
└── init/
    ├── 01_init.sql                 # 既存（雛形・サンプル users テーブル）→ 本仕様のスキーマに置き換え
    └── 02_seed.sql                 # 新規: 書籍の初期データ（販売停止の書籍を1冊以上含める）

docker-compose.yml                  # 既存（雛形）: 変更不要
.env.example                        # 既存（雛形）: 変更不要
```

**Structure Decision**: Option 2（frontend + backend）。`origin/main` の雛形が既に同構成であり、`tech-stack.md` §1 の3層構成図とも一致する。フロントエンドのソースルートは雛形に合わせて `frontend/src/app/` とする（`tech-stack.md` §3 の `frontend/app/globals.css` という記載との差異は research.md D-09 を参照）。

## Phase 0: Outline & Research

**Output**: [research.md](./research.md)

Technical Context に未解決項目はないが、`tech-stack.md` に記載された方針を実装レベルへ具体化する必要がある論点を D-01〜D-11 として整理し、決定・根拠・却下案を記録した。

| ID | 論点 | 決定（要約） |
|---|---|---|
| D-01 | カート状態の保持方式 | React Context ＋ `localStorage` |
| D-02 | 注文完了画面への注文情報の受け渡し | `sessionStorage` の一度きり読み出し（URL に注文番号を含めない） |
| D-03 | 注文番号の生成方式 | ULID 形式（Base32・26文字）を `crypto.randomBytes` で自前実装 |
| D-04 | 書籍の販売状態の表現 | `books.is_available` (BOOLEAN) |
| D-05 | 商品一覧の表示順 | `id` 昇順で固定 |
| D-06 | UI・CSS 方針 | CSS Modules ＋ `globals.css` の共有変数（UI ライブラリ不使用） |
| D-07 | テストフレームワーク | Jest（`next/jest` / `ts-jest` ＋ `supertest`） |
| D-08 | 注文確定の重複防止 | 送信中のボタン無効化 ＋ サーバ側の冪等キー |
| D-09 | フロントエンドのソースルート | `frontend/src/app/`（雛形準拠） |
| D-10 | 金額の型 | 整数円（`INT UNSIGNED` / TypeScript `number`） |
| D-11 | API のエラー応答形式 | `{ error: { code, message, details? } }` に統一 |

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete ✅

**Outputs**:

- [data-model.md](./data-model.md) — spec.md の Key Entities から `books` / `orders` / `order_items` の3テーブルを導出。カートは非永続のためテーブルを持たない
- [contracts/](./contracts/) — REST API の取り決め
  - `GET /api/books` — 販売中の書籍一覧（FR-001, FR-001a, FR-001c, FR-001d）
  - `GET /api/books/:id` — 書籍詳細。販売停止・不存在は 404（FR-005, FR-005a）
  - `POST /api/orders` — 注文作成。バリデーション・スナップショット化・注文番号発行（FR-017〜FR-024）
- [quickstart.md](./quickstart.md) — 雛形の取り込みから起動・受け入れ確認までの手順

### 後続フェーズ（本コマンドの範囲外）

| 順序 | コマンド | 成果物 |
|---|---|---|
| 1 | `/speckit.design basic` / `detail` / `table` | 基本設計書・詳細設計書・テーブル定義書（HTML・憲法§7） |
| 2 | `/speckit.review` | 設計フェーズの承認記録（憲法§6） |
| 3 | `/speckit.tasks` | `tasks.md` |
| 4 | `/speckit.implement` | ソースコード |

## Complexity Tracking

> Constitution Check に正当化を要する違反がないため、記載なし。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| （なし） | — | — |
