# Implementation Plan: カート機能（追加・変更・削除）

**Branch**: `feature/002-cart-management` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-cart-management/spec.md`

## Summary

カートはフロントエンドのReact Contextのみで完結するフィーチャー。
バックエンドAPIやDBテーブルは新規作成しない。
`CartContext` で `items: CartItem[]` と `totalAmount` を管理し、追加・数量変更・削除操作を提供する。
カート画面（`/cart`）で内容確認・調整、書籍詳細画面（`/books/:id`）からカート追加を行う。
詳細な設計判断は [research.md](research.md) を参照。

## Technical Context

**Language/Version**: TypeScript（strict mode）

**Primary Dependencies**: Next.js 14（フロントエンド）、React 18（Context API）

**Storage**: なし（カートはブラウザのメモリ内状態のみ。DB永続化不要）

**Testing**: tsc による型チェック（テストフレームワークはスコープ外）

**Target Platform**: Webアプリケーション（フロントエンド: localhost:3000）

**Project Type**: web-service（フロントエンドのみ。このフィーチャーはバックエンド変更なし）

**Performance Goals**: 数量変更・削除後の合計金額更新が即時（体感遅延なし）（SC-002, SC-003）

**Constraints**: カートの永続化はスコープ外。在庫チェック・送料計算はスコープ外

**Scale/Scope**: 開発・学習用途、カート画面1画面（書籍詳細画面への追加ボタン含む）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | チェック内容 | 結果 |
|---|---|---|
| I. 仕様準拠 | 実装範囲が spec.md FR-001〜FR-010 の範囲内であること | ✅ PASS |
| II. 人間最終判断 | マージ・デプロイの最終実行は人間が行う | ✅ PASS |
| III. セキュリティ第一 | カートはブラウザ内のみで管理。機密情報なし | ✅ PASS |
| IV. 破壊的操作禁止 | DBへの書き込みなし。破壊的操作は発生しない | ✅ PASS |
| V. スコープ厳守 | カート画面・書籍詳細への追加ボタンのみ。永続化・在庫管理は実装しない | ✅ PASS |

**Gate結果: PASS** — Phase 0 / Phase 1 design ともに通過

## Project Structure

### Documentation (this feature)

```text
specs/002-cart-management/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── cart-context.md  # Phase 1 output ✅ (UIコントラクト)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── context/
│   │   └── CartContext.tsx      # カート状態管理（React Context + Provider）
│   ├── pages/
│   │   ├── books/
│   │   │   └── [id].tsx         # 「カートに追加」ボタン追加（既存ファイル修正）
│   │   └── cart.tsx             # カート画面（/cart）
│   ├── components/
│   │   ├── CartItem.tsx         # カートアイテム行UI（書名・単価・数量・小計・削除）
│   │   └── CartSummary.tsx      # 合計金額表示（カート画面下部）
│   └── types/
│       └── index.ts             # CartItem, CartState 型定義
└── (バックエンド変更なし)
```

**Structure Decision**: フロントエンドのみ変更。`CartContext.tsx` を新規作成し、
全ページを `CartProvider` でラップする（`_app.tsx` でプロバイダーを追加）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

憲法チェック全項目 PASS のため記載不要。
