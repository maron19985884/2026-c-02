# Quickstart: 注文フォーム・注文完了画面

## 前提

- Docker / Docker Compose が利用可能であること（`requirements.md`制約条件）
- 002-book-catalog-detail・003-cart-managementが導入済みであること（`books`テーブル、カート画面が動作すること）

## 起動手順

1. `docker compose up -d` でfrontend（3000番）・backend（4000番）・mysql（3306番）を起動する
2. `mysql/init/02_orders_seed.sql`により`orders`・`order_items`テーブルが自動作成されることを確認する（初期データなし）
3. `http://localhost:3000` から書籍をカートに追加し、カート画面から「注文手続きへ」を選択して注文フォーム画面（`/order`）へ遷移できることを確認する

## 動作確認シナリオ（spec.mdの受け入れ基準に対応）

| # | 手順 | 期待結果 | 対応 |
|---|---|---|---|
| 1 | カートに書籍を入れた状態で注文フォーム画面を開く | 注文商品（書名・単価・数量・小計）と合計金額が表示される | US1 |
| 2 | 氏名・住所・メールアドレスを未入力のまま「注文する」を押す | 各項目にエラーメッセージが表示され、画面に留まる | US2 |
| 3 | メールアドレスに`invalid`のような形式不正な値を入力して「注文する」を押す | メールアドレスにエラーメッセージが表示され、画面に留まる | US2 |
| 4 | 氏名・住所・メールアドレスをすべて正しく入力して「注文する」を押す | 注文完了画面（`/order/complete`）へ遷移する | US2 |
| 5 | 注文完了画面を確認する | 注文完了メッセージと注文番号（例: `ORD-000001`）が表示される | US3 |
| 6 | 「商品一覧へ戻る」リンクを選択する | 商品一覧画面へ遷移する | US3 |
| 7 | 注文確定後、カート画面を開く | カートが空になっている（research.md #6） | US2 |

## API動作確認

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"山田太郎","customerAddress":"東京都千代田区1-1-1","customerEmail":"taro@example.com","items":[{"bookId":1,"quantity":2}]}'

curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"","customerAddress":"","customerEmail":"invalid","items":[]}'   # 400 validation_error を確認
```

## テスト実行

```bash
# バックエンド（単体・契約テスト）
cd backend && npm run test

# フロントエンド（単体・コンポーネントテスト）
cd frontend && npm run test

# E2E（要: docker compose up -d が起動中であること）
cd e2e && npm run test
```

E2Eテスト（`e2e/tests/order-checkout.spec.ts`）は上記シナリオ1〜7を、カートに書籍を追加するところから通しで自動化する。
