# Implementation Plan: 商品一覧画面

**Branch**: `004-book-list-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-book-list-page/spec.md`
**Tech Stack**: Defined in `tech-stack.md` (do NOT re-select here)

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

未ログインの購入希望者が商品一覧画面を開くと、販売中の書籍（書影・タイトル・著者・価格）を登録順（ID昇順）でグリッド表示し、書籍をクリックすると商品詳細画面へ遷移できるようにする（REQ-001〜003）。技術的には、バックエンド（Express）が `GET /api/books` で書籍一覧をID昇順で返し、フロントエンド（Next.js）がそれをグリッド表示する。書籍0件時は空状態、取得失敗時は共通エラー表示、書影未設定時は共通プレースホルダー画像を表示する（Clarifications Session 2026-09-09）。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド・バックエンド共通）
**Primary Dependencies**: フロントエンド: Next.js 14.2.3 / React 18／バックエンド: Node.js 20 LTS + Express 4.18 + mysql2 3.6.x + cors 2.8.x
**Storage**: MySQL 8.0（`books` テーブル。`mysql/init/` の初期化SQLで初期データ投入）
**Testing**: Jest 29.x（`ts-jest` / `next/jest`）。バックエンドは `supertest`、フロントエンドは `@testing-library/react` + `@testing-library/jest-dom`。カバレッジ目標80%（憲法§2 暫定値）
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306。Docker Desktop on Windows）
**Project Type**: Web application（frontend + backend 分離構成。tech-stack.md §1）
**Performance Goals**: 主要画面のレスポンスは95パーセンタイルで2秒以内（要件定義書§4／憲法§4 暫定基準。学習・デモ用途のため厳密な数値目標なし）
**Constraints**: ログイン・決済・在庫管理・検索/フィルターは対象外（要件定義書§2、tech-stack.md §9）。SQLはプレースホルダ必須・`any`型禁止・接続情報は`.env`経由（tech-stack.md §8）。UIはCSS Modulesのみ（UIライブラリ不使用、tech-stack.md §2）
**Scale/Scope**: ローカル単一利用者、書籍件数は学習・デモ規模（少数〜数十件を想定）。ページネーションは行わず常に全件表示（Clarifications Session 2026-09-09）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法条項 | ゲート内容 | 本機能での対応 | 判定 |
|---|---|---|---|
| §1 コード品質 | Lintエラー0件必須 | frontend/backend それぞれに ESLint 設定（`next/core-web-vitals` / `@typescript-eslint`）を適用し、`lint` スクリプトを用意する | PASS |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト必須、カバレッジ80% | 書籍一覧取得サービス（ソート順・DB→ビューモデル変換）と、一覧取得APIの結合テスト、フロントの空状態/エラー状態/グリッド表示のコンポーネントテストを用意する | PASS |
| §3 UX一貫性 | エラー表示・空状態表示を全画面で統一 | 共通コンポーネント `ErrorNotice` / `EmptyState`（tech-stack.md記載の方針）をこの機能で新規作成し、以降の画面でも再利用する | PASS |
| §4 パフォーマンス | 95パーセンタイル2秒以内（暫定） | 一覧取得は単純な `SELECT ... ORDER BY id ASC`（全件、絞り込みなし）のみで、学習・デモ規模のデータ量では基準を満たす見込み。追加のキャッシュ等は不要 | PASS |
| §5 技術的意思決定 | 技術選定はtech-stack.mdで確定済み、plan フェーズで選び直さない | 本plan はtech-stack.mdの技術（Next.js/Express/MySQL/Jest等）をそのまま使用し、新規ライブラリを追加しない | PASS |
| §7 設計ルール | 基本設計書・詳細設計書・テーブル定義書はHTMLベース | 本機能はウォーターフォールの `/speckit.design` を別途使用する場合に対応（本plan.mdはSpec Kit標準の設計成果物） | N/A（`/speckit.design`実行時に対応） |

**結果**: 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/004-book-list-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）— 採用
backend/
├── src/
│   ├── db/
│   │   └── pool.ts              # mysql2 コネクションプール（.env経由で接続情報を注入）
│   ├── services/
│   │   └── bookService.ts       # books テーブルからID昇順で一覧取得
│   ├── api/
│   │   └── booksRouter.ts       # GET /api/books ルーティング
│   └── index.ts                 # Express アプリ起動（cors設定含む）
└── tests/
    ├── unit/
    │   └── bookService.test.ts
    └── integration/
        └── booksApi.test.ts     # supertest による GET /api/books 結合テスト

frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx             # 商品一覧画面（"/" ルート）
│   │   └── page.module.css
│   ├── components/
│   │   ├── BookGrid.tsx         # グリッド表示（US1, FR-001, FR-006, FR-009）
│   │   ├── BookCard.tsx         # 書影・タイトル・著者・価格（US2, FR-002, FR-008）
│   │   ├── ErrorNotice.tsx      # 共通エラー表示（FR-007。他画面と共用）
│   │   └── EmptyState.tsx       # 共通空状態表示（FR-004。他画面と共用）
│   ├── lib/
│   │   └── api/
│   │       └── books.ts         # fetchBooks(): backend の GET /api/books を呼び出す
│   └── types/
│       └── book.ts              # Book / BookListItem 型定義
└── tests/
    └── unit/
        ├── BookGrid.test.tsx
        └── BookCard.test.tsx

mysql/
└── init/
    └── 01_init.sql               # books テーブル定義＋初期データ（デモ用書籍数件）
```

**Structure Decision**: Option 2（Web application: frontend + backend 分離）を採用。`tech-stack.md` §1 の3層構成（Next.js ⇄ Express ⇄ MySQL）に従う。現時点でリポジトリに `frontend/` `backend/` `mysql/` ディレクトリは未作成のため、本機能の実装（`/speckit.implement`）で上記構成を新規作成する。ディレクトリ名・配置は `tech-stack.md` および main ブランチで採用済みの構成（`docker-compose.yml` が参照する `frontend` / `backend` / `mysql` の各ビルドコンテキスト）と整合させる。

## Complexity Tracking

*本機能に憲法違反はないため、記載事項なし。*
