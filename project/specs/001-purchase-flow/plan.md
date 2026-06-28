# Implementation Plan: 購買フロー全体（5画面）

**Branch**: `feature/001-purchase-flow` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-purchase-flow/spec.md`

## Summary

購入希望者が書籍を探して注文を完了できる購買フローを5画面で実装する。
商品一覧・商品詳細はバックエンドAPIから書籍データを取得して表示、
カートはフロントエンドのReact Context でセッション管理し、
注文フォームでバリデーションを通過した後に注文確定APIを呼び出して注文番号を発行する。
詳細な設計判断は [research.md](research.md) を参照。

## Technical Context

**Language/Version**: TypeScript（strict mode）

**Primary Dependencies**: Next.js 14（フロントエンド）、Express 4（バックエンドREST API）、mysql2（DBドライバ）、React 18

**Storage**: MySQL 8.0

**Testing**: tsc による型チェック（テストフレームワークはスコープ外）

**Target Platform**: Webアプリケーション（Docker Compose: frontend:3000 / backend:4000 / mysql:3306）

**Project Type**: web-service（フロントエンド + バックエンド分離構成）

**Performance Goals**: 全画面遷移・API応答が3秒以内（SC-002）

**Constraints**: DB接続情報は `.env` で管理・コード直書き禁止。ログイン・決済・在庫管理・送料計算はスコープ外

**Scale/Scope**: 開発・学習用途（同時接続数・稼働率要件なし）、5画面・3 REST APIエンドポイント

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | チェック内容 | 結果 |
|---|---|---|
| I. 仕様準拠 | 実装範囲が spec.md FR-001〜FR-012 の範囲内であること | ✅ PASS |
| II. 人間最終判断 | マージ・デプロイの最終実行は人間が行う | ✅ PASS |
| III. セキュリティ第一 | DB接続情報は `.env` で管理。コード直書きなし | ✅ PASS |
| IV. 破壊的操作禁止 | 書籍取得（SELECT）と注文確定（INSERT）のみ。DELETE/DROPは不要 | ✅ PASS |
| V. スコープ厳守 | 5画面（一覧・詳細・カート・注文フォーム・注文完了）のみ実装 | ✅ PASS |

**Gate結果: PASS** — Phase 0 / Phase 1 design ともに通過

## Project Structure

### Documentation (this feature)

```text
specs/001-purchase-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   ├── books-api.md     # Phase 1 output ✅
│   └── orders-api.md    # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── book.ts              # Book 型定義
│   │   └── order.ts             # Order, OrderItem 型定義
│   ├── services/
│   │   ├── book_service.ts      # 書籍一覧・詳細取得ロジック
│   │   └── order_service.ts     # 注文確定ロジック・注文番号採番
│   └── api/
│       ├── books.ts             # GET /api/books, GET /api/books/:id
│       └── orders.ts            # POST /api/orders
├── database/
│   └── migrations/
│       ├── 001_create_books.sql
│       └── 002_create_orders.sql
└── index.ts                     # Express サーバーエントリポイント

frontend/
├── src/
│   ├── pages/
│   │   ├── index.tsx            # 商品一覧画面 (/)
│   │   ├── books/
│   │   │   └── [id].tsx         # 商品詳細画面 (/books/:id)
│   │   ├── cart.tsx             # カート画面 (/cart)
│   │   ├── order.tsx            # 注文フォーム画面 (/order)
│   │   └── order/
│   │       └── complete.tsx     # 注文完了画面 (/order/complete)
│   ├── components/
│   │   ├── BookCard.tsx         # 書籍カードUI
│   │   ├── CartItem.tsx         # カートアイテムUI
│   │   ├── OrderForm.tsx        # 注文フォームUI（バリデーション含む）
│   │   └── CartSummary.tsx      # 注文フォーム内カート表示
│   ├── context/
│   │   └── CartContext.tsx      # カート状態管理（React Context）
│   ├── services/
│   │   ├── book_api.ts          # GET /api/books, GET /api/books/:id クライアント
│   │   └── order_api.ts         # POST /api/orders クライアント
│   └── types/
│       └── index.ts             # 共有型定義（Book, CartItem 等）
└── next.config.js               # Next.js 設定（APIプロキシ設定含む）
```

**Structure Decision**: フロントエンド・バックエンド分離構成を採用。`project.md` の技術スタックに準拠。
カートはDB管理せずReact Contextで完結し、シンプルな構成を維持する。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

憲法チェック全項目 PASS のため記載不要。
