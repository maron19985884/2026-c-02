# Implementation Plan: 注文フォーム画面

**Branch**: `007-order-form-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-order-form-page/spec.md`
**Tech Stack**: Defined in `tech-stack.md`（do NOT re-select here）

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

未ログインの購入希望者が `006-cart-page` で確認したカート内容を持って注文フォーム画面（`/order`）に遷移し、氏名・住所・メールアドレスを入力して注文を確定する（REQ-012〜REQ-015）。氏名・住所はそれぞれ1つの自由記述欄とし（spec.md Clarifications）、メールアドレスは形式チェックを行う。3項目とも「注文する」ボタン押下時にまとめてバリデーションし、不備があれば該当欄にエラーメッセージを表示する。同一画面内にカート内容（書名・数量・小計）と合計金額を読み取り専用で表示する。カートが空（0件）の状態で本画面に到達した場合はカート画面へ自動的に差し戻す（spec.md Clarifications）。

技術的には、注文確定は新規バックエンドAPI `POST /api/orders` を新設して対応する（MySQLへの永続化が要件のため、`006`までと異なりバックエンド変更を伴う）。価格改ざん防止のため、注文金額・書籍情報はクライアント送信値をそのまま信用せず、`bookId`を基にサーバー側で`books`テーブルを再参照して算出・スナップショットする。注文番号は`tech-stack.md`§6で却下済みの`ulid`パッケージを使わず、`crypto.randomBytes`を用いた自前のULID風生成関数（`backend/src/lib/generateOrderNumber.ts`）で発行する。新規テーブル`orders` / `order_items`を`mysql/init/02_orders.sql`に追加する。フロントエンドは新規ページ`frontend/src/app/order/page.tsx`、フォームコンポーネント`OrderForm.tsx`、確認表示コンポーネント`OrderSummary.tsx`、バリデーションユーティリティ`lib/validateOrderForm.ts`（tech-stack.md §7 命名例）、API呼び出し`lib/api/orders.ts`を追加する。注文確定成功後は`CartContext`に新設する`clearCart()`でカートを空にし、注文完了画面（REQ-016〜018、別スペック・未実装）への遷移先として`/order/complete/[orderNumber]`ルートへ`router.push`する（遷移動作のみが本機能のスコープで、完了画面自体の実装は対象外）。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド・バックエンド両方を変更）
**Primary Dependencies**: フロントエンド: Next.js 14.2.3 / React 18。バックエンド: Node.js 20 LTS / Express 4.18 / `mysql2` 3.6.x / `cors` 2.8.x（いずれも新規依存追加なし、tech-stack.md §2・§6。注文番号生成はNode標準の`crypto`モジュールのみで実装し、`ulid`パッケージは導入しない）
**Storage**: MySQL 8.0。新規テーブル`orders`・`order_items`を追加する（本機能で初めてバックエンドが書き込みを行う機能。`books`テーブルは参照のみで変更なし）
**Testing**: Jest 29.x。フロントエンド: `@testing-library/react` + `@testing-library/jest-dom`（`next/jest`）で`validateOrderForm` / `OrderForm` / `OrderSummary` / `order/page.tsx`（空カートリダイレクト含む）を検証。バックエンド: `ts-jest` + `supertest`で`generateOrderNumber`（単体）・`orderService`（単体）・`POST /api/orders`（結合）を検証。カバレッジ目標80%（憲法§2 暫定値）
**Target Platform**: Docker Compose（frontend :3000 / backend :4000 / mysql :3306。Docker Desktop on Windows）
**Project Type**: Web application（frontend + backend 分離構成。tech-stack.md §1。`004`〜`006`で構築済みの構成を継続利用）
**Performance Goals**: 主要画面のレスポンスは95パーセンタイルで2秒以内（要件定義書§4／憲法§4 暫定基準）。`POST /api/orders`はローカル単一利用者・小規模データを前提とし、書籍参照・注文行挿入をトランザクション内で行っても基準を十分満たす
**Constraints**: ログイン・決済・在庫管理・検索/フィルターは対象外（要件定義書§2、tech-stack.md §9）。`any`型禁止、SQL直接連結禁止（プレースホルダ必須）（tech-stack.md §8）。UIはCSS Modulesのみ（UIライブラリ不使用）。氏名・住所は分割せず単一欄、バリデーションは送信時にまとめて実施（spec.md Clarifications / Assumptions）。破壊的DDLをアプリケーションコードから発行しない（憲法§1）
**Scale/Scope**: ローカル単一利用者。カート内の書籍種類・数量に上限なし（`006`の方針を継承）。注文1件あたりの明細行数に上限は設けない

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法条項 | ゲート内容 | 本機能での対応 | 判定 |
|---|---|---|---|
| §1 コード品質 | Lintエラー0件必須。破壊的DDL禁止 | 既存のESLint設定（フロント: `next/core-web-vitals`、バック: `@typescript-eslint`）をそのまま適用。`mysql/init/02_orders.sql`は`CREATE TABLE IF NOT EXISTS`のみで`DROP`/`TRUNCATE`は使用しない | PASS |
| §2 テスト基準 | 主要ビジネスロジックに単体テスト必須、カバレッジ80% | `validateOrderForm`・`generateOrderNumber`・`orderService`（合計金額算出・スナップショット生成）を単体テスト、`POST /api/orders`を結合テスト対象とする（要件定義書§4「注文番号発行」も明記済み） | PASS |
| §3 UX一貫性 | エラー表示・空状態表示を全画面で統一 | フィールドエラーは既存`ErrorNotice`と統一感のある表示規則で実装し、通信エラー時（FR-010）も`ErrorNotice`パターンを踏襲する。空カート時は新規UIを増やさずカート画面へ差し戻す（spec.md Clarifications） | PASS |
| §4 パフォーマンス | 95パーセンタイル2秒以内（暫定） | `POST /api/orders`はトランザクション内で書籍参照・INSERTを行うのみの軽量処理であり、ローカル単一利用者環境で基準を十分満たす | PASS |
| §5 技術的意思決定 | 技術選定はtech-stack.mdで確定済み、plan フェーズで選び直さない。新規依存追加時は選定理由を明記 | 新規npm依存を追加しない（`ulid`不使用の方針をtech-stack.md §6の却下理由どおり踏襲し、Node標準`crypto`で自前実装）。DB接続は既存の`mysql2`プールを再利用 | PASS |
| §7 設計ルール | 基本設計書・詳細設計書・テーブル定義書はHTMLベース | ウォーターフォールで`/speckit.design`を別途使用する場合に対応（本plan.mdはSpec Kit標準の設計成果物） | N/A（`/speckit.design`実行時に対応） |

**結果**: 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/007-order-form-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/            # Phase 1 output
│   └── orders-api.md
└── tasks.md              # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（frontend + backend）— 継続採用
backend/
├── src/
│   ├── api/
│   │   ├── booksRouter.ts       # 変更なし
│   │   └── ordersRouter.ts      # [新規] POST /api/orders
│   ├── services/
│   │   ├── bookService.ts       # 変更なし（orderServiceから書籍参照のため呼び出し）
│   │   └── orderService.ts      # [新規] 注文作成（書籍参照・金額算出・トランザクション）
│   ├── lib/
│   │   └── generateOrderNumber.ts  # [新規] ULID風注文番号生成（crypto.randomBytes）
│   ├── types/
│   │   ├── book.ts              # 変更なし
│   │   └── order.ts             # [新規] Order / OrderItem / CreateOrderRequest 型
│   ├── db/
│   │   └── pool.ts              # 変更なし（トランザクションは pool.getConnection() を利用）
│   └── index.ts                 # [変更] ordersRouter を /api/orders にマウント
└── tests/
    ├── unit/
    │   ├── generateOrderNumber.test.ts  # [新規]
    │   └── orderService.test.ts         # [新規]
    └── integration/
        └── ordersApi.test.ts            # [新規]

frontend/
├── src/
│   ├── app/
│   │   └── order/
│   │       ├── page.tsx          # [新規] 注文フォーム画面（US1〜US4、空カートリダイレクト）
│   │       └── page.module.css   # [新規]
│   ├── components/
│   │   ├── OrderForm.tsx         # [新規] 氏名・住所・メールアドレス入力＋バリデーションエラー表示（US1, US2）
│   │   ├── OrderForm.module.css  # [新規]
│   │   ├── OrderSummary.tsx      # [新規] 注文商品（カート内容）・合計金額の読み取り専用表示（US3）
│   │   ├── OrderSummary.module.css # [新規]
│   │   └── ErrorNotice.tsx       # 既存を再利用（注文確定API失敗時、FR-010）
│   ├── context/
│   │   └── CartContext.tsx       # [変更] clearCart() を追加（注文確定成功時にカートを空にする）
│   ├── lib/
│   │   ├── validateOrderForm.ts  # [新規] 氏名・住所・メールアドレスのバリデーション（tech-stack.md §7 命名例）
│   │   └── api/
│   │       ├── books.ts          # 変更なし
│   │       └── orders.ts         # [新規] ブラウザから POST /api/orders を呼び出す（NEXT_PUBLIC_API_URL使用）
│   └── types/
│       ├── cart.ts               # 変更なし
│       └── order.ts              # [新規] CustomerInfo / OrderFormErrors / CreateOrderResponse 型
└── tests/
    └── unit/
        ├── validateOrderForm.test.ts  # [新規]
        ├── OrderForm.test.tsx         # [新規]
        ├── OrderSummary.test.tsx      # [新規]
        └── OrderPage.test.tsx         # [新規]（空カートリダイレクト、送信成功/失敗の分岐）

mysql/
└── init/
    └── 02_orders.sql          # [新規] orders / order_items テーブル定義（`01_init.sql`の後に実行される）

docker-compose.yml               # [変更] frontend サービスに NEXT_PUBLIC_API_URL を追加（ブラウザから直接 backend を呼ぶため）
```

**Structure Decision**: Option 2（Web application: frontend + backend 分離）を継続採用。本機能で初めてバックエンドに書き込み系API（`POST /api/orders`）とMySQLへの新規テーブルを追加する。フロントエンドは`004`〜`006`で確立済みのディレクトリ構成（`app/` / `components/` / `context/` / `lib/` / `types/`）をそのまま踏襲し、新規ディレクトリは作成しない。

## Complexity Tracking

*本機能に憲法違反はないため、記載事項なし。*
