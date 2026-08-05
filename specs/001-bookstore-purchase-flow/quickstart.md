# Quickstart: 個人運営オンライン書店（購買フロー特化版）

実装完了後、この手順でローカルDocker環境上に一連の購買フローが動作することを確認する（`docs/prompt-playbook.md` Phase 6 に対応）。

## Prerequisites

- Docker / Docker Compose がローカルにインストールされていること
- リポジトリ直下に `docker-compose.yml`、`frontend/Dockerfile`、`backend/Dockerfile` が存在すること（Phase 4で作成）

## Setup

```bash
docker compose up --build
```

- バックエンドが起動する際、`backend/src/db` の初期化処理でSQLiteのスキーマ作成とシードデータ（書籍データ）の投入が行われる想定。
- フロントエンドは `http://localhost:3000`（想定）、バックエンドAPIは `http://localhost:4000`（想定）で待受ける。ポート番号は実装時に `docker-compose.yml` で確定する。

## 検証シナリオ（spec.mdのUser Story 1〜4に対応）

1. `http://localhost:3000` を開き、商品一覧がグリッド形式で表示される（書影・タイトル・著者・価格）ことを確認する（US1 / FR-001, FR-002）
2. 任意の書籍をクリックし、商品詳細（書影・タイトル・著者・価格・説明文）が表示されることを確認する（US1 / FR-003, FR-004）
3. 「カートに追加」を押し、一覧に戻れることを確認する（US1 / FR-005, FR-006）
4. 同じ書籍をもう一度カートに追加し、カート画面で数量が2に加算されている（別行にならない）ことを確認する（FR-021）
5. カート画面で数量を増減し、小計・合計金額が即時反映されることを確認する（US2 / FR-008）
6. 数量を1まで減らし、それ以上減らせない（非活性化される）ことを確認する（FR-022）
7. 書籍を削除し、カートから消えて合計金額が更新されることを確認する（US2 / FR-009）
8. カートを空にした状態で「注文手続きに進む」導線が表示されないことを確認する（FR-020）
9. 商品をカートに入れた状態で注文フォームに進み、氏名・住所・メールアドレスを空のまま「注文する」を押し、それぞれエラーメッセージが表示されることを確認する（US3 / FR-013）
10. メールアドレスに形式不正な値（例: `abc`）を入力し、エラーが表示されることを確認する（US3 / FR-013）
11. 正しい値を入力して「注文する」を押し、注文完了画面に遷移し、注文受付メッセージと注文番号（`ORD-YYYYMMDD-NNNN`形式）が表示されることを確認する（US4 / FR-016, FR-017）
12. 「商品一覧へ戻る」リンクで商品一覧画面に戻れることを確認する（US4 / FR-018）

## 実行結果

**実施日**: 2026-08-05
**実施方法**: ⚠️ **静的コードレビューのみ**（`docker compose up` の実機起動は未実施）

このセッションの実行環境にはDockerがインストールされておらず、`docker compose up`を実際に実行して画面を操作した確認はできていない。上記1〜12の検証シナリオについては、実装コード（`frontend/src/pages/*`, `frontend/src/contexts/CartContext.tsx`, `backend/src/api/*`, `backend/src/services/*`）を通し読みし、各シナリオに対応する処理が実装されていることをコードレベルで確認した（静的レビュー）。

| # | シナリオ | 対応コード | 静的確認結果 |
|---|---|---|---|
| 1 | 商品一覧のグリッド表示 | `frontend/src/pages/index.tsx` | `fetchBooks`→CSS Gridで表示。実装あり |
| 2 | 商品詳細の表示 | `frontend/src/pages/books/[id].tsx` | `fetchBookById`→書影・タイトル・著者・価格・説明文を表示。実装あり |
| 3 | カート追加→一覧に戻れる | 同上 + `CartContext.addBook` | ボタン押下で`addBook`呼び出し、`Link`で一覧へ導線あり |
| 4 | 同一書籍の重複追加で数量加算 | `frontend/src/lib/cart.ts` `addItem` | 既存bookId検出時に数量+1するロジックあり（cart.test.tsで検証） |
| 5 | 数量増減のリアルタイム反映 | `frontend/src/pages/cart.tsx` + `CartContext` | `useMemo`でitems変更時に`totalAmount`再計算、再レンダリングされる構造 |
| 6 | 数量1で減ボタン非活性化 | `frontend/src/pages/cart.tsx`（`disabled={item.quantity <= MIN_QUANTITY}`） | 実装あり |
| 7 | 削除で合計即時更新 | 同上（`remove`） | 実装あり |
| 8 | カート空で導線非表示 | `frontend/src/pages/cart.tsx`（`{items.length > 0 && <Link .../>}`） | 実装あり |
| 9 | 必須未入力でエラー表示 | `frontend/src/components/OrderForm.tsx` + `frontend/src/lib/validation.ts` | `validateOrderForm`でエラー時`role="alert"`表示、送信を止める |
| 10 | メール形式不正でエラー表示 | 同上（`EMAIL_REGEX`） | 実装あり。加えてバックエンド`orderValidation.ts`でも二重に検証 |
| 11 | 注文確定→完了画面に注文番号表示 | `frontend/src/pages/order.tsx`→`order-complete.tsx`、`backend/src/services/orderService.ts` | `POST /api/orders`のレスポンスを`sessionStorage`経由で受け渡し、`OrderCompleteMessage`で表示 |
| 12 | 一覧に戻るリンク | `frontend/src/pages/order-complete.tsx` | 実装あり |

**未確認事項（実機での確認が必要）**:
- `docker compose up --build`が実際にエラーなくビルド・起動するか（特に`better-sqlite3`のネイティブビルド）
- フロントエンド（ブラウザ）からバックエンドAPIへの実際のCORS越しの通信が想定どおり動作するか
- SQLiteファイルへの書き込み権限・ボリュームマウントが想定どおり機能するか
- 実際のブラウザ操作でのUI崩れ・アクセシビリティ（憲法3章）の見た目上の確認

**実行手順（実機で確認する場合）**:
```bash
docker compose up --build
# ブラウザで http://localhost:3000 を開き、上記1〜12を操作して確認する
```
