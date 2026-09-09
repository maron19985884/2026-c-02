# Implementation Plan: 注文完了画面

**Branch**: `008-order-complete-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-order-complete-page/spec.md`
**Tech Stack**: Defined in `tech-stack.md`（do NOT re-select here）

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

`007-order-form-page` で注文確定に成功した購入希望者を`/order/complete/[orderNumber]`へ遷移させ（実装済み）、注文完了メッセージ・注文番号・商品一覧へ戻るリンクを表示する（REQ-016〜018）。注文完了画面はNext.jsのサーバーコンポーネントとし、URLの`orderNumber`をキーにバックエンドから注文情報を再取得して表示する。これにより、ブラウザの再読み込みでも同一の注文番号を再表示できる（spec.md Clarifications）。該当する注文が存在しない・取得に失敗した場合は商品一覧画面（`/`）へリダイレクトする。

技術的には、バックエンドに新規エンドポイント`GET /api/orders/:orderNumber`を追加し、`orderService`に`getOrderByNumber`を新設する（新規テーブル・スキーマ変更は不要。既存の`orders`テーブルの`order_number`一意インデックスをそのまま利用する）。カートのクリアは`007`の実装（`order/page.tsx`が注文確定API成功直後に`clearCart()`を呼び出す）で既に完了しており、本機能での追加実装は不要（spec.md FR-006の追認のみ）。フロントエンドは新規ページ`frontend/src/app/order/complete/[orderNumber]/page.tsx`（サーバーコンポーネント、`books/[id]/page.tsx`と同様のfetchパターンを踏襲）と、`frontend/src/lib/api/orders.ts`への`fetchOrderByNumber`追加のみで実現する。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド・バックエンド両方を変更）
**Primary Dependencies**: フロントエンド: Next.js 14.2.3 / React 18。バックエンド: Node.js 20 LTS / Express 4.18 / `mysql2` 3.6.x（いずれも新規依存追加なし、tech-stack.md §2）
**Storage**: MySQL 8.0。既存の`orders`テーブル（`007`で追加済み）を参照のみ。新規テーブル・カラム追加なし（`order_number`は`UNIQUE`制約済みでそのまま検索キーに利用できる）
**Testing**: Jest 29.x。フロントエンド: `@testing-library/react`（`next/jest`）で`order/complete/[orderNumber]/page.tsx`（表示・リダイレクト分岐）を検証。バックエンド: `ts-jest` + `supertest`で`orderService.getOrderByNumber`（単体）・`GET /api/orders/:orderNumber`（結合）を検証。カバレッジ目標80%（憲法§2 暫定値）
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306。Docker Desktop on Windows）
**Project Type**: Web application（frontend + backend 分離構成。tech-stack.md §1。`004`〜`007`で構築済みの構成を継続利用）
**Performance Goals**: 主要画面のレスポンスは95パーセンタイルで2秒以内（要件定義書§4／憲法§4 暫定基準）。`GET /api/orders/:orderNumber`は主キー相当の一意インデックス検索1件のみで、ローカル単一利用者環境で基準を十分満たす
**Constraints**: ログイン・決済・在庫管理・検索/フィルターは対象外（要件定義書§2、tech-stack.md §9）。`any`型禁止、SQL直接連結禁止（プレースホルダ必須）（tech-stack.md §8）。UIはCSS Modulesのみ（UIライブラリ不使用）。破壊的DDLをアプリケーションコードから発行しない（憲法§1）
**Scale/Scope**: ローカル単一利用者。注文完了画面は単一の注文（1件）の表示のみを扱う

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法条項 | ゲート内容 | 本機能での対応 | 判定 |
|---|---|---|---|
| §1 コード品質 | Lintエラー0件必須。破壊的DDL禁止 | 既存のESLint設定をそのまま適用。DDL変更なし（既存`orders`テーブルの参照のみ） | PASS |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト必須、カバレッジ80% | `orderService.getOrderByNumber`を単体テスト、`GET /api/orders/:orderNumber`を結合テスト対象とする | PASS |
| §3 UX一貫性 | 画面遷移・エラー表示・空状態の扱いを全画面で統一 | 「表示前提を満たさない場合は前段の画面へ差し戻す」という`007`（空カート時にカート画面へリダイレクト）と同一パターンを踏襲し、注文情報が取得できない場合は商品一覧画面へリダイレクトする（spec.md Clarifications） | PASS |
| §4 パフォーマンス | 95パーセンタイル2秒以内（暫定） | `GET /api/orders/:orderNumber`は`order_number`の一意インデックスに対する単純SELECTのみで軽量 | PASS |
| §5 技術的意思決定 | 技術選定はtech-stack.mdで確定済み、plan フェーズで選び直さない。新規依存追加時は選定理由を明記 | 新規npm依存を追加しない。既存の`mysql2`プール・Express Routerパターンを再利用 | PASS |
| §7 設計ルール | 基本設計書・詳細設計書・テーブル定義書はHTMLベース | ウォーターフォールで`/speckit.design`を別途使用する場合に対応（本plan.mdはSpec Kit標準の設計成果物） | N/A（`/speckit.design`実行時に対応） |

**結果**: 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/008-order-complete-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/             # Phase 1 output
│   └── get-order-api.md
└── tasks.md               # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）— 継続採用
backend/
├── src/
│   ├── api/
│   │   └── ordersRouter.ts      # [変更] GET /:orderNumber を追加
│   ├── services/
│   │   └── orderService.ts      # [変更] getOrderByNumber を追加（存在しなければ null を返す）
│   ├── types/
│   │   └── order.ts             # [変更] GetOrderResponse 型を追加
│   └── db/
│       └── pool.ts              # 変更なし
└── tests/
    ├── unit/
    │   └── orderService.test.ts     # [変更] getOrderByNumber のテストを追加
    └── integration/
        └── ordersApi.test.ts        # [変更] GET /api/orders/:orderNumber のテストを追加

frontend/
├── src/
│   ├── app/
│   │   └── order/
│   │       └── complete/
│   │           └── [orderNumber]/
│   │               ├── page.tsx          # [新規] 注文完了画面（US1〜US3、取得失敗時は一覧へリダイレクト）
│   │               └── page.module.css   # [新規]
│   └── lib/
│       └── api/
│           └── orders.ts         # [変更] fetchOrderByNumber を追加（サーバーコンポーネントから利用、API_INTERNAL_URL使用）
└── tests/
    └── unit/
        └── OrderCompletePage.test.tsx  # [新規]（正常表示、取得失敗時のリダイレクト）
```

**Structure Decision**: Option 2（Web application: frontend + backend 分離）を継続採用。新規テーブル・`docker-compose.yml`の変更は不要（`API_INTERNAL_URL`は`007`までに設定済み）。フロントエンドは`004`〜`007`で確立済みのディレクトリ構成（`app/` / `lib/`）をそのまま踏襲し、新規ディレクトリは`app/order/complete/[orderNumber]/`のみ追加する。

## Complexity Tracking

*本機能に憲法違反はないため、記載事項なし。*
