# Quickstart: 注文フォーム画面

本機能（注文フォーム画面 `/order` の顧客情報入力・バリデーション・注文内容確認・注文確定）を実装後、以下の手順で動作確認する。

## 前提

- Docker Desktop が起動していること
- `004-book-list-page`〜`006-cart-page`が実装済みで、商品一覧・商品詳細画面から「カートに追加」ができ、カート画面（`/cart`）から「注文手続きへ」で`/order`に遷移できること
- `mysql/init/02_orders.sql`が追加され、コンテナ初回起動時に`orders` / `order_items`テーブルが作成されること（既存のMySQLボリュームが残っている場合は`docker compose down -v`でボリュームを削除してから起動し直す）

## 起動

```bash
docker compose up --build
```

- frontend: http://localhost:3000
- backend: http://localhost:4000

## 検証手順

### 1. 顧客情報入力欄の表示確認（User Story 1）

1. 商品一覧・商品詳細画面から1冊以上を「カートに追加」し、カート画面から「注文手続きへ」を押す。
2. **期待結果**: `/order`が表示され、氏名・住所・メールアドレスの入力欄がそれぞれ表示される（FR-001）。各欄に値を入力すると反映される。

### 2. カートが空の場合のアクセス制御確認（Edge Case, FR-012）

1. ブラウザの開発者ツールで`localStorage`の`bookstore.cart`を削除するか`[]`にする。
2. http://localhost:3000/order を直接開く。
3. **期待結果**: カート画面（`/cart`）へ自動的に差し戻される。

### 3. バリデーションの確認（User Story 2）

1. カートに1件以上ある状態で`/order`を開き、氏名・住所・メールアドレスをすべて空欄のまま「注文する」を押す。
2. **期待結果**: 3項目すべてについてエラーメッセージが表示され、注文は確定しない（FR-003）。
3. メールアドレス欄に`invalid-email`のような`@`を含まない値を入力し、他は正しく入力して「注文する」を押す。
4. **期待結果**: メールアドレスの形式が不正である旨のエラーメッセージが表示され、注文は確定しない（FR-004）。
5. すべての項目を正しく修正して「注文する」を押す。
6. **期待結果**: エラーメッセージは表示されなくなり、注文確定処理に進む。

### 4. 注文内容の同画面確認（User Story 3）

1. カートに単価の異なる書籍を複数件入れ、`/order`を開く。
2. **期待結果**: 顧客情報の入力欄と同じ画面内に、カートに入っている各書籍（書名・数量・小計）と合計金額が表示される（FR-006）。合計金額はカート画面（`/cart`）で表示されていた金額と一致する。

### 5. 注文確定の確認（User Story 4）

1. 氏名・住所・メールアドレスをすべて正しく入力し、「注文する」を押す。
2. **期待結果**: 注文が確定し、`/order/complete/<注文番号>`へ遷移する（完了画面自体は別機能で実装予定、FR-008, FR-009）。
3. ブラウザの開発者ツールで`localStorage`の`bookstore.cart`を確認する。
4. **期待結果**: カートが空配列になっている（`research.md` D-05）。
5. MySQLに接続し、`orders` / `order_items`テーブルを確認する。

   ```bash
   docker compose exec mysql mysql -u appuser -p appdb -e "SELECT * FROM orders; SELECT * FROM order_items;"
   ```

   **期待結果**: 入力した顧客情報と、カート内容に対応する明細行が保存されている。`unit_price` / `book_title`はDB上の`books`テーブルの値と一致する（送信した値ではなくサーバー側で算出された値であること）。

### 6. 注文確定APIの失敗時の確認（Edge Case, FR-010）

1. `docker compose stop backend`等でバックエンドを停止した状態で、`/order`から「注文する」を押す。
2. **期待結果**: エラーメッセージが表示され、注文フォーム画面にとどまる。入力済みの氏名・住所・メールアドレスは消えない。

## 自動テスト実行

```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test
```

- backend: `generateOrderNumber`（単体）、`orderService`（単体、金額算出・スナップショット・書籍不存在時のエラー）、`POST /api/orders`（結合、契約テストの観点を含む）の各テストが通ることを確認する。
- frontend: `validateOrderForm`（単体）、`OrderForm` / `OrderSummary`（コンポーネントテスト）、`order/page.tsx`（空カートリダイレクト・送信成功時の遷移とカートクリア・送信失敗時のエラー表示）の各テストが通ることを確認する。
