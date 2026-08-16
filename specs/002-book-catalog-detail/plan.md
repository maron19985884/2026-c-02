# Implementation Plan: 商品一覧・商品詳細

**Branch**: `002-book-catalog-detail` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-book-catalog-detail/spec.md`
**Tech Stack**: Defined in `docs/tech-stack-template.md` (do NOT re-select here)

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

販売中の書籍を商品一覧画面（グリッド形式）に表示し、書籍をクリックすると商品詳細画面（書影・タイトル・著者・価格・説明文）に遷移できるようにする。詳細画面の「カートに追加」ボタンで書籍をカートに追加でき、追加後も一覧画面に戻って閲覧を継続できる。バックエンドはMySQLの`books`テーブルに対する読み取り専用REST APIを提供し、フロントエンド（Next.js）が一覧・詳細表示を行う。カートの中身は本機能では永続化・表示せず、クライアント側の一時的な状態としてのみ保持し、カートの中身確認・編集は別機能に委ねる（spec.mdのAssumptions参照）。

## Technical Context

> `docs/tech-stack-template.md`から各項目を転記。未定義項目はない。

**Language/Version**: TypeScript 5（フロントエンド・バックエンド共通）
**Primary Dependencies**: フロントエンド: Next.js 14 (App Router) + React 18 / バックエンド: Express 4 + mysql2
**Storage**: MySQL 8.0
**Testing**: Vitest（フロントエンド・バックエンド共通）+ Supertest（バックエンドAPI統合テスト）+ React Testing Library（フロントエンドコンポーネントテスト）
**Target Platform**: Docker Compose上のLinuxコンテナ（frontend: 3000番, backend: 4000番, mysql: 3306番）
**Project Type**: Web application（frontend + backend）
**Performance Goals**: `requirements.md`の非機能要件に数値指定なし（「性能: 特定なし（学習・デモ用途）」）。憲法セクション4の暫定基準（95パーセンタイルで2秒以内、単一接続前提）を目安として適用する（自動テストによる性能ゲートは設けない）
**Constraints**: ログイン・セッション基盤なし（匿名アクセス前提、spec.md FR-007）。検索・フィルター、レビュー・評価、在庫数表示、決済処理、管理画面は対象外（spec.md FR-010）。破壊的DB操作（DROP/TRUNCATE等）は本機能では発生しない（CLAUDE.md禁止事項）
**Scale/Scope**: 書籍数十冊規模、画面2つ（商品一覧・商品詳細）、匿名の単一ユーザー種別

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法セクション | 判定 | 根拠 |
|---|---|---|
| 1. コード品質原則 | PASS | ESLintを導入する（`docs/tech-stack-template.md`）。エラー0件は`.github/workflows/quality-gate.yml`で機械的に強制される |
| 2. テスト基準 | PASS | 主要ロジック（書籍取得・カート追加）はVitestで単体テストする。技術選定書にカバレッジ数値の指定がないため憲法の暫定基準（80%）を適用する。spec.mdのFR-001〜FR-006は全て優先度「高」相当のため、Supertestによる結合テストも実施する |
| 3. UX一貫性 | PASS | 技術選定書にCSSフレームワーク指定がないためブラウザデフォルトスタイルを基準に統一する。空状態（0件時）・見つかりません状態はspec.mdのEdge Casesで定義済み |
| 4. パフォーマンス要件 | PASS | `requirements.md`に数値指定がないため、憲法の暫定基準を適用する（上記Technical Context参照） |
| 5. 技術的意思決定ルール | PASS | 技術は`docs/tech-stack-template.md`で本plan.mdの前に確定済み。本ファイルで技術を選び直していない |
| 6. 開発方法論の運用ルール | 未確定（本機能の実施には影響なし） | 本プロジェクトをウォーターフォールで正式運用するかは未確定。新規開発のためBrownfieldには該当しない |
| 7. 設計ルール | PASS | HTMLベースの基本設計書・詳細設計書・テーブル定義書を`specs/002-book-catalog-detail/design/`に作成済み（`docs/design-doc-guide.md`の必須セクションに準拠） |

違反なし。Complexity Trackingは該当なし。

**Phase 1設計後の再評価**: `data-model.md`・`contracts/books-api.md`・`quickstart.md`の内容を反映して再確認した結果、追加された要素（`books`テーブル、読み取り専用API2本、クライアント側カートstore）はいずれも上表の判定を変えない。特に2（テスト基準）はVitest/Supertest/React Testing Libraryの追加で担保され、`mysql/init/01_books_seed.sql`は`CREATE TABLE IF NOT EXISTS` + `INSERT`のみで構成される想定（破壊的操作なし）。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/002-book-catalog-detail/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── books-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）を採用
docker-compose.yml         # frontend(3000)/backend(4000)/mysql(3306)の3サービス定義
.env.example                # DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/NEXT_PUBLIC_API_URL

backend/
├── package.json            # express, mysql2, typescript
├── tsconfig.json
├── Dockerfile
├── .dockerignore
├── .eslintrc
├── vitest.config.ts
├── src/
│   ├── index.ts                # Expressアプリのエントリポイント
│   ├── db/
│   │   └── pool.ts             # mysql2コネクションプール
│   ├── routes/
│   │   └── booksRoutes.ts      # GET /api/books, GET /api/books/:id
│   ├── repositories/
│   │   └── bookRepository.ts   # booksテーブルへの読み取りアクセス
│   └── types/
│       └── book.ts             # Book / BookSummary 型定義
└── tests/
    ├── booksRoutes.test.ts     # Supertestによる統合テスト
    └── bookRepository.test.ts  # リポジトリ層の単体テスト（カバレッジ確保のため追加）

frontend/
├── package.json             # next@14, react@18, typescript
├── tsconfig.json
├── next.config.js
├── Dockerfile
├── .dockerignore
├── .eslintrc
├── vitest.config.ts
├── src/
│   └── app/
│       ├── layout.tsx                  # ルートレイアウト（App Router必須ファイル）
│       ├── globals.css                 # 全画面共通のデザイントークン・スタイル
│       ├── page.tsx                    # 商品一覧画面
│       ├── books/
│       │   └── [id]/
│       │       └── page.tsx            # 商品詳細画面
│       ├── components/
│       │   ├── BookGrid.tsx            # 一覧のグリッド表示
│       │   ├── BookCard.tsx            # 一覧の1書籍カード
│       │   └── AddToCartButton.tsx     # カート追加ボタン
│       └── lib/
│           ├── apiClient.ts            # バックエンドAPI呼び出し共通処理
│           ├── booksApi.ts             # 書籍一覧・詳細取得
│           └── cartStore.ts            # クライアント側カート状態（localStorage）
└── tests/
    ├── setup.ts                 # RTLの自動クリーンアップ等の共通セットアップ
    ├── BookGrid.test.tsx
    ├── BookDetailPage.test.tsx
    ├── HomePage.test.tsx         # 商品一覧画面の状態分岐テスト（カバレッジ確保のため追加）
    ├── AddToCartButton.test.tsx  # 成功/失敗表示のテスト（カバレッジ確保のため追加）
    ├── apiClient.test.ts         # fetchJsonの分岐テスト（カバレッジ確保のため追加）
    ├── booksApi.test.ts          # listBooks/getBookのテスト（カバレッジ確保のため追加）
    └── cartStore.test.ts

mysql/
└── init/
    └── 01_books_seed.sql       # booksテーブル作成 + サンプルデータ投入（CREATE/INSERTのみ）

e2e/                        # Playwrightによる再実行可能なE2Eテスト（別途追加）
├── package.json
├── playwright.config.ts
└── tests/
    └── book-catalog.spec.ts
```

**Structure Decision**: Option 2（Web application: frontend + backend）を採用。バックエンドは読み取り専用のREST APIを`/api/books`配下に追加し、フロントエンドはNext.js App Routerの`app/books/[id]`で詳細画面を新設する。カート機能は本機能の対象外のため、クライアント側の一時的な状態（`cartStore.ts`）としてのみ実装する。

ファイル命名は、React コンポーネントを PascalCase（例: `BookGrid.tsx`）、それ以外の TypeScript ファイルを camelCase（例: `bookRepository.ts`）とする。`CLAUDE.md`のプロジェクト共通命名規則は未記入のため、本featureではこの慣例で統一し、プロジェクト全体のルールは別途人間が確定させること。

## Complexity Tracking

該当なし（Constitution Checkに違反がないため、本セクションは適用しない）。
