# Implementation Plan: 商品詳細画面

**Branch**: `005-book-detail-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-book-detail-page/spec.md`
**Tech Stack**: Defined in `tech-stack.md`（do NOT re-select here）

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

未ログインの購入希望者が商品一覧から書籍をクリックして商品詳細画面を開くと、書影・タイトル・著者・価格（税込み）・説明文を表示する（REQ-004）。「カートに追加」ボタンを1回押すだけで当該書籍を数量1件としてカートに追加でき、既にカートにある場合は数量に1を加算する（上限なし・連打時もクリックごとに加算、Clarifications）。追加成功はボタン表記の一時変化で伝え、専用の通知コンポーネントは設けない。追加後もそのまま「一覧へ戻る」導線から商品一覧に戻り、カートの内容は保持される（REQ-005, REQ-006）。技術的には、バックエンド（Express）に `GET /api/books/:id` を追加して単一書籍（説明文込み）を返し、存在しない場合は404を返す。フロントエンド（Next.js）は動的ルート `app/books/[id]/page.tsx` でこれを取得し、取得失敗（404含む）時は商品一覧画面と同じ `ErrorNotice` を表示する。カート状態は新設する `CartContext`（React Context + `localStorage`、tech-stack.md §6の方針）で管理し、ルートレイアウトに配置することで画面遷移をまたいで保持する。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド・バックエンド共通）
**Primary Dependencies**: フロントエンド: Next.js 14.2.3 / React 18／バックエンド: Node.js 20 LTS + Express 4.18 + mysql2 3.6.x + cors 2.8.x（新規依存追加なし、tech-stack.md §2・§6）
**Storage**: MySQL 8.0（既存 `books` テーブルをそのまま利用。新規テーブルなし）。カート内容はバックエンドに永続化せず、フロントエンドの `localStorage` に保持する（tech-stack.md §6「状態管理ライブラリ不使用、Context/useState + localStorage」）
**Testing**: Jest 29.x（`ts-jest` / `next/jest`）。バックエンドは `supertest`、フロントエンドは `@testing-library/react` + `@testing-library/jest-dom`。カバレッジ目標80%（憲法§2 暫定値）
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306。Docker Desktop on Windows）
**Project Type**: Web application（frontend + backend 分離構成。tech-stack.md §1。`004-book-list-page` で構築済みの構成を継続利用）
**Performance Goals**: 主要画面のレスポンスは95パーセンタイルで2秒以内（要件定義書§4／憲法§4 暫定基準）
**Constraints**: ログイン・決済・在庫管理・検索/フィルターは対象外（要件定義書§2、tech-stack.md §9）。SQLはプレースホルダ必須・`any`型禁止・接続情報は`.env`経由（tech-stack.md §8）。UIはCSS Modulesのみ（UIライブラリ不使用）。状態管理ライブラリ（Redux等）は導入しない（tech-stack.md §6）
**Scale/Scope**: ローカル単一利用者、書籍件数は学習・デモ規模。カート内の同一書籍の数量に上限は設けない（Clarifications Session 2026-09-09）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法条項 | ゲート内容 | 本機能での対応 | 判定 |
|---|---|---|---|
| §1 コード品質 | Lintエラー0件必須 | 既存の ESLint 設定（`next/core-web-vitals` / `@typescript-eslint`）をそのまま適用。新規ファイルも同一ルールに従う | PASS |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト必須、カバレッジ80% | `bookService.fetchBookById`（単体）、`GET /api/books/:id`（結合）、`CartContext` の追加・加算ロジック（単体）、`AddToCartButton` の表記変化（コンポーネントテスト）を用意する | PASS |
| §3 UX一貫性 | エラー表示・空状態表示を全画面で統一 | `004-book-list-page` で作成済みの `ErrorNotice` をそのまま再利用し、取得失敗・存在しないIDの双方に適用する（新規コンポーネントを作らない） | PASS |
| §4 パフォーマンス | 95パーセンタイル2秒以内（暫定） | `GET /api/books/:id` は主キー検索（`WHERE id = ?`）のみで、学習・デモ規模のデータ量では基準を満たす見込み | PASS |
| §5 技術的意思決定 | 技術選定はtech-stack.mdで確定済み、plan フェーズで選び直さない | 新規ライブラリを追加せず、tech-stack.md §6 で明記された「Context + useState + localStorage」方針をそのまま踏襲する | PASS |
| §7 設計ルール | 基本設計書・詳細設計書・テーブル定義書はHTMLベース | ウォーターフォールで `/speckit.design` を別途使用する場合に対応（本plan.mdはSpec Kit標準の設計成果物） | N/A（`/speckit.design`実行時に対応） |

**結果**: 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/005-book-detail-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）— 採用（004と同一構成を継続）
backend/
├── src/
│   ├── services/
│   │   └── bookService.ts       # [変更] fetchBookById(id) を追加
│   ├── api/
│   │   └── booksRouter.ts       # [変更] GET /api/books/:id を追加
│   └── types/
│       └── book.ts              # 変更なし（既存 Book 型に description を含む）
└── tests/
    ├── unit/
    │   └── bookService.test.ts  # [変更] fetchBookById のテストを追加
    └── integration/
        └── booksApi.test.ts     # [変更] GET /api/books/:id のテストを追加

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # [変更] CartProvider でラップ
│   │   └── books/
│   │       └── [id]/
│   │           ├── page.tsx          # [新規] 商品詳細画面（US1, US2, US3）
│   │           └── page.module.css   # [新規]
│   ├── components/
│   │   ├── AddToCartButton.tsx        # [新規] カート追加ボタン（US2, FR-002,003,010,011）
│   │   ├── AddToCartButton.module.css # [新規]
│   │   ├── ErrorNotice.tsx            # 既存を再利用（FR-008, FR-009）
│   │   └── EmptyState.tsx             # 変更なし（本機能では未使用）
│   ├── context/
│   │   └── CartContext.tsx       # [新規] CartProvider / useCart（localStorage連携）
│   ├── lib/
│   │   └── api/
│   │       └── books.ts          # [変更] fetchBookById(id) を追加
│   └── types/
│       ├── book.ts               # 変更なし
│       └── cart.ts               # [新規] CartItem 型定義
└── tests/
    └── unit/
        ├── AddToCartButton.test.tsx  # [新規]
        └── CartContext.test.tsx      # [新規]
```

**Structure Decision**: Option 2（Web application: frontend + backend 分離）を継続採用。`004-book-list-page` で構築済みの `backend/` `frontend/` `mysql/` 構成に追加・変更を加える形で実装する（新規ディレクトリ構成の変更なし）。カート状態はバックエンドAPIを新設せず、フロントエンドの `CartContext` + `localStorage` に閉じる（tech-stack.md §6）。

## Complexity Tracking

*本機能に憲法違反はないため、記載事項なし。*
