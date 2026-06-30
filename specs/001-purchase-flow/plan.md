# Implementation Plan: オンライン書店 購買フロー

**Branch**: `001-purchase-flow` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-purchase-flow/spec.md`

## Summary

個人運営オンライン書店の購買フロー（5画面）を実装する。
ユーザーは書籍一覧 → 詳細 → カート → 注文フォーム → 注文完了の順に操作し、
認証・決済なしで注文を完了できる。

フロントエンドは Next.js 14 Pages Router + React 18 + TypeScript。
カート状態はクライアント (localStorage) で管理。
バックエンドは Express 4 REST API + TypeScript。
データは MySQL 8.0 に永続化（books・orders・order_items）。

## Technical Context

**Language/Version**: TypeScript 5 — Node.js 20 (backend), Next.js 14 / React 18 (frontend)

**Primary Dependencies**:
- Backend: Express 4, mysql2 3, cors
- Frontend: Next.js 14, React 18

**Storage**: MySQL 8.0（テーブル: books, orders, order_items）

**Testing**: 未設定（テストフレームワークなし）— quickstart.md の手動検証シナリオで代替

**Target Platform**: Webブラウザ、Docker環境（frontend :3000, backend :4000, MySQL :3306）

**Performance Goals**: 全画面3秒以内表示（SC-002）、カート更新1秒以内（SC-003）

**Constraints**: 認証なし、カートはブラウザセッションのみ、Docker環境必須、TypeScript strict mode

**Scale/Scope**: 個人書店、書籍5冊以上のシードデータ、5画面の購買フロー

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | Pre-research | Post-design | 判定 |
|------|-------------|-------------|------|
| I. Purchase-Flow First | FR-001〜FR-017 がすべて U-01〜U-18 にマップ | 全エンドポイントが購買フローに直結 | ✅ |
| II. Full-Stack Separation | frontend→HTTP JSON→backend の設計 | services/ 層でfetchを集約、コンポーネントから直接fetch禁止 | ✅ |
| III. Type Safety | 両 tsconfig.json に strict: true | api-types.ts で全API型定義、any禁止 | ✅ |
| IV. Docker-First | docker-compose.yml 3サービス構成済み | .env 経由の設定、ハードコーディングなし | ✅ |
| V. Simplicity | 5画面、auth/payment/admin スコープ外 | カートはlocalStorage、追加依存なし | ✅ |

**全ゲート通過 — 設計を進める。**

## Project Structure

### Documentation (this feature)

```text
specs/001-purchase-flow/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── api-contracts.md # Phase 1 output (/speckit-plan command)
│   └── api-types.ts     # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/
│   │   ├── books.ts       # GET /books, GET /books/:id
│   │   └── orders.ts      # POST /orders
│   ├── services/
│   │   ├── bookService.ts # DB queries for books
│   │   └── orderService.ts # DB queries for orders + order_items
│   ├── types/
│   │   └── api.ts         # Shared TypeScript types (mirrors api-types.ts)
│   ├── db.ts              # mysql2 connection pool
│   └── index.ts           # Express app (existing, to be updated)

frontend/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # 商品一覧（U-01〜U-03）
│   │   ├── books/
│   │   │   └── [id].tsx       # 商品詳細（U-04〜U-06）
│   │   ├── cart.tsx           # カート（U-07〜U-11）
│   │   ├── checkout.tsx       # 注文フォーム（U-12〜U-15）
│   │   └── order-complete.tsx # 注文完了（U-16〜U-18）
│   ├── components/
│   │   ├── BookCard.tsx       # 一覧の1冊分カード
│   │   ├── CartItemRow.tsx    # カートの1行
│   │   └── OrderSummary.tsx   # 注文フォーム内の注文内容表示
│   ├── context/
│   │   └── CartContext.tsx    # React Context + localStorage カート管理
│   ├── services/
│   │   ├── bookApi.ts         # GET /books, GET /books/:id
│   │   └── orderApi.ts        # POST /orders
│   └── types/
│       └── api.ts             # TypeScript types (mirrors api-types.ts)

mysql/
└── init/
    ├── 01_init.sql            # 既存（usersテーブル → 書き換え対象）
    └── 02_books_seed.sql      # 書籍シードデータ（5冊以上）
```

**Structure Decision**: Web application (Option 2 — frontend + backend separation).
既存の `backend/src/index.ts` と `frontend/src/app/` を拡張・整理する。
MySQL init は `01_init.sql` を books/orders/order_items スキーマに書き換え、
seed データを `02_books_seed.sql` として追加する。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

なし — 全原則クリア。追加の複雑性なし。
