# Implementation Plan: カート画面

**Branch**: `006-cart-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-cart-page/spec.md`
**Tech Stack**: Defined in `tech-stack.md`（do NOT re-select here）

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

未ログインの購入希望者が `005-book-detail-page` で構築済みの `CartContext`（`localStorage` 保持）に書籍を追加した後、新設するカート画面（`/cart`）でその内容を確認・調整する（REQ-007〜REQ-011）。画面は各カート項目（書名・単価・数量・小計）を一覧表示し、数量は+/-ボタンのみで増減（下限1、上限なし）、削除操作で行ごと除去、合計金額（全小計の総和）を常時表示する。カートが空の場合は`EmptyState`で空状態を示し「注文手続きへ」ボタンは表示しない。1件以上ある場合のみ「注文手続きへ」ボタンを表示し、注文フォーム画面（`/order`、未実装・将来機能）へ遷移させる。技術的には新規バックエンドAPIは不要（カートはフロントエンドの`localStorage`のみで完結、tech-stack.md §6）。既存の`CartContext`に`increaseQuantity` / `decreaseQuantity` / `removeItem`を追加し、合計金額計算は新規ユーティリティ`calcCartTotal`（tech-stack.md §7で命名例として明記済み）に切り出して単体テスト対象とする。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンドのみ変更。バックエンド変更なし）
**Primary Dependencies**: フロントエンド: Next.js 14.2.3 / React 18（新規依存追加なし、tech-stack.md §2・§6）
**Storage**: バックエンド・MySQLへの変更なし。カート内容は引き続きフロントエンドの`localStorage`（キー: `bookstore.cart`、`005-book-detail-page`のD-03で確立済み）に保持する
**Testing**: Jest 29.x + `@testing-library/react` + `@testing-library/jest-dom`（`next/jest`）。カバレッジ目標80%（憲法§2 暫定値）。バックエンド変更がないため `supertest` を用いた結合テストは本機能では追加しない
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306。Docker Desktop on Windows）
**Project Type**: Web application（frontend + backend 分離構成。tech-stack.md §1。`004-book-list-page` / `005-book-detail-page` で構築済みの構成を継続利用。本機能はfrontendのみ変更）
**Performance Goals**: 主要画面のレスポンスは95パーセンタイルで2秒以内（要件定義書§4／憲法§4 暫定基準）。本画面はクライアントサイドの状態更新のみで、ネットワーク往復を伴わないため基準を十分満たす
**Constraints**: ログイン・決済・在庫管理・検索/フィルターは対象外（要件定義書§2、tech-stack.md §9）。`any`型禁止（tech-stack.md §8）。UIはCSS Modulesのみ（UIライブラリ不使用）。状態管理ライブラリ（Redux等）は導入しない（tech-stack.md §6）。数量変更は+/-ボタンのみで数値直接入力は行わない（spec.md Clarifications）
**Scale/Scope**: ローカル単一利用者、カート内の書籍種類・数量に上限は設けない（spec.md Clarifications / Edge Cases）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法条項 | ゲート内容 | 本機能での対応 | 判定 |
|---|---|---|---|
| §1 コード品質 | Lintエラー0件必須 | 既存の ESLint 設定（`next/core-web-vitals`）をそのまま適用。新規ファイルも同一ルールに従う | PASS |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト必須、カバレッジ80% | `calcCartTotal`（単体）、`CartContext`の`increaseQuantity` / `decreaseQuantity` / `removeItem`（単体）、`CartItemRow`・`CartPage`の表示/操作（コンポーネントテスト）を用意する | PASS |
| §3 UX一貫性 | エラー表示・空状態表示を全画面で統一 | `004-book-list-page` で作成済みの`EmptyState`をそのまま再利用し、カートが空の場合の表示に適用する（新規コンポーネントを作らない） | PASS |
| §4 パフォーマンス | 95パーセンタイル2秒以内（暫定） | 本画面はAPI呼び出しを伴わず、`localStorage`から読み込んだ配列に対するクライアントサイド計算のみのため基準を十分満たす | PASS |
| §5 技術的意思決定 | 技術選定はtech-stack.mdで確定済み、plan フェーズで選び直さない | 新規ライブラリを追加せず、tech-stack.md §6「Context + useState + localStorage」方針をそのまま踏襲する | PASS |
| §7 設計ルール | 基本設計書・詳細設計書・テーブル定義書はHTMLベース | ウォーターフォールで `/speckit.design` を別途使用する場合に対応（本plan.mdはSpec Kit標準の設計成果物） | N/A（`/speckit.design`実行時に対応） |

**結果**: 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/006-cart-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output（本機能はバックエンドAPI変更なしのため空）
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）— 継続採用。本機能はfrontendのみ変更
backend/
# 変更なし（新規API不要。既存の GET /api/books, GET /api/books/:id のみ）

frontend/
├── src/
│   ├── app/
│   │   └── cart/
│   │       ├── page.tsx          # [新規] カート画面（US1〜US5）
│   │       └── page.module.css   # [新規]
│   ├── components/
│   │   ├── CartItemRow.tsx        # [新規] カート内1書籍分の行（書名・単価・数量+/-・小計・削除、US1,2,3）
│   │   ├── CartItemRow.module.css # [新規]
│   │   ├── EmptyState.tsx         # 既存を再利用（カートが空の場合、US1 Edge Cases）
│   │   └── ErrorNotice.tsx        # 変更なし（本機能では未使用。カート表示はローカル状態のみで通信エラーが発生しないため）
│   ├── context/
│   │   └── CartContext.tsx       # [変更] increaseQuantity / decreaseQuantity / removeItem を追加
│   ├── lib/
│   │   └── calcCartTotal.ts      # [新規] カート項目配列から合計金額を算出する純粋関数（tech-stack.md §7 命名例）
│   └── types/
│       └── cart.ts               # 変更なし（既存 CartItem 型を再利用）
└── tests/
    └── unit/
        ├── calcCartTotal.test.ts     # [新規]
        ├── CartContext.test.tsx      # [変更] increaseQuantity / decreaseQuantity（下限1）/ removeItem のテストを追加
        └── CartItemRow.test.tsx      # [新規]
```

**Structure Decision**: Option 2（Web application: frontend + backend 分離）を継続採用。本機能はバックエンド・MySQLに変更を加えず、`005-book-detail-page` で構築済みの`frontend/src/context/CartContext.tsx`を拡張し、新規画面`frontend/src/app/cart/page.tsx`を追加する形で実装する（新規ディレクトリ構成の変更なし）。

## Complexity Tracking

*本機能に憲法違反はないため、記載事項なし。*
