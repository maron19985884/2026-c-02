# Implementation Plan: 注文フォーム・注文完了画面

**Branch**: `004-order-checkout` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-order-checkout/spec.md`
**Tech Stack**: Defined in `docs/tech-stack-template.md` (do NOT re-select here)

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

注文フォーム画面（`/order`）と注文完了画面（`/order/complete`）を新設する。注文フォームでは、カート画面（003-cart-management）の`cartStore.getItems()`と既存`GET /api/books`を突き合わせた注文商品・合計金額を表示しつつ、氏名・住所・メールアドレスを入力させる。「注文する」ボタン押下時、フロントエンドでクライアント側バリデーション（未入力・メール形式）を行い、問題なければ新規APIの`POST /api/orders`を呼び出す。バックエンドは`orders`・`order_items`テーブルに注文情報を永続化し、一意な注文番号を発行してレスポンスに含める。フロントエンドは応答された注文番号を持って注文完了画面へ遷移し、注文完了メッセージ・注文番号・一覧へ戻るリンクを表示する。注文確定後はカートの内容をクリアする。

## Technical Context

> `docs/tech-stack-template.md`から各項目を転記。002-book-catalog-detail・003-cart-managementと同一の技術選定を継続する。

**Language/Version**: TypeScript 5（フロントエンド・バックエンド共通、002と同一）
**Primary Dependencies**: フロントエンド: Next.js 14 (App Router) + React 18／バックエンド: Express 4 + mysql2（002と同一）
**Storage**: MySQL 8.0。本機能で新規に`orders`・`order_items`テーブルを追加する（002以来はじめてのDBスキーマ変更）
**Testing**: Vitest + React Testing Library（フロントエンド）、Vitest + Supertest（バックエンド、002以来はじめてバックエンドのテスト対象コードが追加される）、Playwright（E2E）
**Target Platform**: 002・003と同一（Docker Compose上のLinuxコンテナ、frontend: 3000番, backend: 4000番, mysql: 3306番）
**Project Type**: Web application（002・003の既存frontend/backendへの追加）
**Performance Goals**: `requirements.md`に数値指定なし。002・003のplan.mdと同じ暫定基準（95パーセンタイルで2秒以内）を踏襲する
**Constraints**: 決済処理・在庫管理・注文ステータス管理は対象外（spec.md Assumptions）。`orders`テーブルへの`DROP`/`TRUNCATE`等の破壊的DDLは生成しない（CLAUDE.md禁止事項）。メールアドレス・氏名・住所等の個人情報を扱うが、認証情報（パスワード・APIキー）ではないため`.env`管理の対象外
**Scale/Scope**: 画面2つ（注文フォーム・注文完了）を新設し、既存のカート画面（003）の「注文手続きへ」リンク先を実装する。バックエンドAPIを1つ追加する

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法セクション | 判定 | 根拠 |
|---|---|---|
| 1. コード品質原則 | PASS | 既存のESLint設定（`frontend/.eslintrc.json` / `backend/.eslintrc.json`）をそのまま使用する |
| 2. テスト基準 | PASS | Vitestで単体テスト（フロントエンド・バックエンド双方）を実施し、憲法の暫定基準（80%）を維持する。Supertestで新規APIの結合テスト、Playwrightで結合的な検証も行う |
| 3. UX一貫性 | PASS | 002・003で確立したデザイントークン・共通クラス（`globals.css`の`.page`・`.state-message`・`.button`等）をそのまま再利用し、独自のスタイルを新設しない。エラーメッセージの表示は`.state-message--error`の方針を踏襲する |
| 4. パフォーマンス要件 | PASS | 002・003と同じ暫定基準を適用する |
| 5. 技術的意思決定ルール | PASS | 技術選定書（`docs/tech-stack-template.md`）は002から変更なし。本plan.mdで技術を選び直していない |
| 6. 開発方法論の運用ルール | 未確定（002・003から変わらず、本機能の実施には影響なし） | ウォーターフォール運用の是非は依然未確定 |
| 7. 設計ルール | 対応予定 | HTMLベースの基本設計書・詳細設計書・テーブル定義書（新規テーブルのため今回は作成する）は、本plan.md・data-model.md・contracts確定後、`/speckit.tasks`着手前に`docs/design-templates/`をコピーして作成する |

違反なし。Complexity Trackingは該当なし。

**Phase 1設計後の再評価**: `data-model.md`・`contracts/orders-api.md`・`quickstart.md`の内容を反映して再確認した結果、新規追加要素（`orders`・`order_items`テーブル、`POST /api/orders`）はいずれも上表の判定を変えない。破壊的DDLは発生せず（`CREATE TABLE`のみ）、決済処理は伴わないことを確認済み。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/004-order-checkout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── orders-api.md
├── design/              # /speckit.tasks着手前に作成（憲法セクション7）
│   ├── basic-design.html
│   ├── detail-design.html
│   └── table-definition.html
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（002-book-catalog-detail・003-cart-managementの構成を継続）

backend/
├── src/
│   ├── types/
│   │   └── order.ts                    # 新規: OrderRequest, OrderResponse等の型
│   ├── repositories/
│   │   └── orderRepository.ts          # 新規: createOrder()（orders・order_itemsへのINSERT）
│   └── routes/
│       └── ordersRoutes.ts             # 新規: POST /
│   └── index.ts                        # 修正: ordersRouterを/api/ordersにマウント
└── tests/
    ├── orderRepository.test.ts         # 新規
    └── ordersRoutes.test.ts            # 新規

frontend/
├── src/
│   └── app/
│       ├── order/
│       │   ├── page.tsx                # 新規: 注文フォーム画面
│       │   └── complete/
│       │       └── page.tsx            # 新規: 注文完了画面
│       ├── components/
│       │   └── OrderSummary.tsx        # 新規: 注文フォーム画面での注文商品一覧・合計金額の読み取り専用表示
│       └── lib/
│           ├── ordersApi.ts            # 新規: POST /api/ordersを呼ぶクライアント
│           ├── orderValidation.ts      # 新規: 氏名・住所・メールアドレスのクライアント側バリデーション
│           │                           #        (実装時に追加。page.tsxはNext.js App Routerの既定エクスポート
│           │                           #        フィールドしか公開できず、検証関数を同ファイル内でexportすると
│           │                           #        next buildの型チェックに失敗するため分離した)
│           └── cartStore.ts            # 修正: clear()を追加（注文確定後のカートクリア用）
└── tests/
    ├── OrderPage.test.tsx              # 新規（バリデーション/送信フローのテストを含む）
    ├── OrderCompletePage.test.tsx      # 新規
    ├── ordersApi.test.ts               # 新規
    └── cartStore.test.ts               # 修正: clear()のテストを追記

mysql/
└── init/
    └── 02_orders_seed.sql              # 新規: orders・order_itemsテーブルのCREATE TABLE（初期データなし）

e2e/
└── tests/
    └── order-checkout.spec.ts          # 新規
```

**Structure Decision**: Option 2（Web application）を継続。バックエンドに`POST /api/orders`を1本追加し、`orders`（注文ヘッダー: 顧客情報・合計金額・注文番号）・`order_items`（注文明細: 書名・単価・数量のスナップショット）の2テーブルを新設する。注文商品のスナップショットを取るのは、後で書籍が販売対象外や価格変更になっても、過去の注文内容が変わらないようにするため（spec.md Key Entities）。フロントエンドは、注文フォーム画面でカート内容の表示に003の`cartStore`・`booksApi`をそのまま再利用し、注文確定時のみ新規`ordersApi.ts`経由でバックエンドと通信する。注文確定成功後は`cartStore.clear()`でカートを空にしてから注文完了画面へ遷移する。003の`cart/page.tsx`・`CartItemRow.tsx`は変更しない（`OrderSummary.tsx`は注文フォーム専用の読み取り専用表示であり、カート画面の編集可能な行UIとは別コンポーネントとする）。

## Complexity Tracking

該当なし（Constitution Checkに違反がないため、本セクションは適用しない）。
