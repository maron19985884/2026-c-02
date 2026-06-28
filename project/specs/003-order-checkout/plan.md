# Implementation Plan: 注文フォームと注文確定処理

**Branch**: `feature/003-order-checkout` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-order-checkout/spec.md`

## Summary

購入希望者がカート内容を確認しながら氏名・住所・メールアドレスを入力し、バリデーション通過後に
注文を確定して一意の注文番号を受け取る機能を実装する。
フロントエンド（Next.js 14）はフォームUIとクライアントサイドバリデーション、
バックエンド（Express 4）は注文確定APIと注文番号採番・サーバーサイドバリデーションを担当する。
詳細は [research.md](research.md) を参照。

## Technical Context

**Language/Version**: TypeScript（strict mode）

**Primary Dependencies**: Next.js 14（フロントエンド）、Express 4（バックエンドREST API）、mysql2（DBドライバ）

**Storage**: MySQL 8.0

**Testing**: tsc による型チェック（テストフレームワークはスコープ外）

**Target Platform**: Webアプリケーション（Docker Compose: frontend:3000 / backend:4000 / mysql:3306）

**Project Type**: web-service（フロントエンド + バックエンド分離構成）

**Performance Goals**: 注文確定API応答・画面遷移が3秒以内（SC-001・SC-005）

**Constraints**: DB接続情報は `.env` で管理・コード直書き禁止。決済処理・注文メール・注文履歴はスコープ外

**Scale/Scope**: 開発・学習用途（同時接続数・稼働率要件なし）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | チェック内容 | 結果 |
|---|---|---|
| I. 仕様準拠 | 実装範囲が spec.md FR-001〜FR-010 の範囲内であること | ✅ PASS |
| II. 人間最終判断 | マージ・デプロイの最終実行は人間が行う | ✅ PASS |
| III. セキュリティ第一 | DB接続情報は `.env` で管理。コード直書きなし | ✅ PASS |
| IV. 破壊的操作禁止 | 注文確定（INSERT）のみ。DELETE/DROP/TRUNCATE は不要 | ✅ PASS |
| V. スコープ厳守 | 注文フォーム(`/order`)と注文完了(`/order/complete`)の2画面のみ | ✅ PASS |

**Gate結果: PASS** — Phase 0 / Phase 1 design ともに通過

## Project Structure

### Documentation (this feature)

```text
specs/003-order-checkout/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── orders-api.md    # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── order.ts              # Order, OrderItem 型定義
│   ├── services/
│   │   └── order_service.ts      # 注文確定ロジック・注文番号採番
│   └── api/
│       └── orders.ts             # POST /api/orders エンドポイント
└── database/
    └── migrations/
        └── 002_create_orders.sql # orders / order_items テーブル作成

frontend/
├── src/
│   ├── pages/
│   │   ├── order.tsx             # 注文フォーム画面 (/order)
│   │   └── order/
│   │       └── complete.tsx      # 注文完了画面 (/order/complete)
│   ├── components/
│   │   ├── OrderForm.tsx         # 注文入力フォームUI・バリデーション
│   │   └── CartSummary.tsx       # カート内容表示（注文フォーム内）
│   └── services/
│       └── order_api.ts          # バックエンドAPI呼び出しクライアント
```

**Structure Decision**: フロントエンド・バックエンド分離構成を採用。`project.md` の技術スタックに準拠。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

憲法チェック全項目 PASS のため記載不要。
