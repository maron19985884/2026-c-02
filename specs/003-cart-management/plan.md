# Implementation Plan: カート画面

**Branch**: `003-cart-management` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-cart-management/spec.md`
**Tech Stack**: Defined in `docs/tech-stack-template.md` (do NOT re-select here)

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

カート画面（`/cart`）を新設し、`localStorage`ベースの`cartStore`（002-book-catalog-detailで実装済み）に保持された書籍ID・数量を、既存の`GET /api/books`（一覧API）から取得した書籍情報と突き合わせて、書名・単価・数量・小計・合計を表示する。数量変更・削除はクライアント側で`cartStore`を更新し、画面を再読み込みせずに反映する。カートに登録済みだが一覧APIの結果に含まれない書籍（＝販売対象外になった書籍）は、一覧結果に存在しないbookIdとして検出し、その旨を示す。バックエンドAPI・DBスキーマの追加・変更は行わない。商品一覧・商品詳細画面（002で実装済み）にカートへの導線を追加する（FR-012）。「注文手続きへ」ボタンは次feature（注文フォーム）へのリンクとする。

## Technical Context

> `docs/tech-stack-template.md`から各項目を転記。002-book-catalog-detailと同一の技術選定を継続する。

**Language/Version**: TypeScript 5（フロントエンドのみ。バックエンドの変更は本機能では発生しない）
**Primary Dependencies**: フロントエンド: Next.js 14 (App Router) + React 18（002と同一）
**Storage**: 変更なし。カートの状態は引き続きブラウザ`localStorage`（`cartStore.ts`を拡張）。MySQLへの新規テーブル・カラム追加はない
**Testing**: Vitest + React Testing Library（フロントエンド単体・コンポーネント）、Playwright（E2E）。バックエンド変更がないためSupertestの対象コードはなし
**Target Platform**: 002と同一（Docker Compose上のLinuxコンテナ、frontend: 3000番, backend: 4000番, mysql: 3306番）
**Project Type**: Web application（002の既存frontend/backendへの追加）
**Performance Goals**: `requirements.md`に数値指定なし。002のplan.mdと同じ暫定基準（95パーセンタイルで2秒以内）を踏襲する
**Constraints**: バックエンドAPI・DBスキーマの変更を伴わない（既存`GET /api/books`を流用）。ログイン・決済処理・送料計算は対象外（spec.md Assumptions）。破壊的DB操作は本機能では発生しない（CLAUDE.md禁止事項、そもそもDB変更なし）
**Scale/Scope**: カート項目数は書籍カタログ規模（数十件）と同程度を上限と想定。画面1つ（カート画面）を追加し、既存2画面（一覧・詳細）にカートへの導線を追加する

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法セクション | 判定 | 根拠 |
|---|---|---|
| 1. コード品質原則 | PASS | 既存のESLint設定（`frontend/.eslintrc.json`）をそのまま使用する |
| 2. テスト基準 | PASS | Vitestで単体・コンポーネントテストを実施し、憲法の暫定基準（80%）を維持する。Playwrightで結合的な検証も行う |
| 3. UX一貫性 | PASS | 002で確立したデザイントークン・共通クラス（`globals.css`の`.page`・`.state-message`・`.button`等）をそのまま再利用し、独自のスタイルを新設しない |
| 4. パフォーマンス要件 | PASS | 002と同じ暫定基準を適用する |
| 5. 技術的意思決定ルール | PASS | 技術選定書（`docs/tech-stack-template.md`）は002から変更なし。本plan.mdで技術を選び直していない |
| 6. 開発方法論の運用ルール | 未確定（002から変わらず、本機能の実施には影響なし） | ウォーターフォール運用の是非は依然未確定 |
| 7. 設計ルール | 対応予定 | HTMLベースの基本設計書・詳細設計書・テーブル定義書は、本plan.md・data-model.md・contracts確定後に`docs/design-templates/`をコピーして作成する |

違反なし。Complexity Trackingは該当なし。

**Phase 1設計後の再評価**: `data-model.md`・`contracts/no-new-api.md`・`quickstart.md`の内容を反映して再確認した結果、追加された要素（クライアント側のみのカート項目合成、`layout.tsx`へのナビゲーション追加）はいずれも上表の判定を変えない。新規バックエンドコード・DBスキーマ変更が発生しないことを`contracts/no-new-api.md`で確認済み。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/003-cart-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output（本機能は新規APIなしのため、既存contracts/books-api.mdの参照のみ）
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Option 2: Web application（002-book-catalog-detailの構成を継続）
# バックエンド（backend/）の変更なし

frontend/
├── src/
│   └── app/
│       ├── layout.tsx                  # 修正: カートへのリンクをヘッダーに追加（FR-012）
│       ├── page.tsx                    # 修正なし（layout.tsx側で対応するため）
│       ├── cart/
│       │   └── page.tsx                # 新規: カート画面
│       ├── components/
│       │   └── CartItemRow.tsx         # 新規: カート内の1書籍行（書名・単価・数量操作・削除ボタン）
│       └── lib/
│           └── cartStore.ts            # 修正: updateQuantity()・removeItem()を追加
└── tests/
    ├── CartPage.test.tsx               # 新規
    └── cartStore.test.ts               # 修正: 追加関数のテストを追記

e2e/
└── tests/
    └── cart.spec.ts                     # 新規
```

**Structure Decision**: Option 2（Web application）を継続。バックエンドAPI・DBスキーマの追加・変更は行わない。カート画面は既存の`GET /api/books`（`booksApi.listBooks()`）を呼び出し、`cartStore.getItems()`が返す`bookId`と突き合わせることで、書名・単価を取得すると同時に、一覧結果に存在しない`bookId`＝販売対象外になった書籍（FR-010）を検出する。この設計により新規バックエンドコードは不要となる。

## Complexity Tracking

該当なし（Constitution Checkに違反がないため、本セクションは適用しない）。
