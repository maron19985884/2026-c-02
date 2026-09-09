# Quickstart: 注文完了画面

本機能（注文完了画面 `/order/complete/[orderNumber]` の完了メッセージ・注文番号・一覧へ戻るリンク表示）を実装後、以下の手順で動作確認する。

## 前提

- Docker Desktop が起動していること
- `004-book-list-page`〜`007-order-form-page`が実装済みで、商品一覧 → 商品詳細 → カート → 注文フォームの一連の流れで注文を確定できること（注文確定後、既に`/order/complete/<orderNumber>`へ遷移する実装が`007`で完了している）

## 起動

```bash
docker compose up --build
```

- frontend: http://localhost:3000
- backend: http://localhost:4000

## 検証手順

### 1. 完了メッセージ・注文番号の表示確認（User Story 1, 2）

1. 商品一覧・商品詳細画面から1冊以上を「カートに追加」し、カート画面から「注文手続きへ」を押す。
2. 氏名・住所・メールアドレスをすべて正しく入力し、「注文する」を押す。
3. **期待結果**: `/order/complete/<注文番号>`へ遷移し、注文が受け付けられたことを示す完了メッセージと、確定した注文の注文番号が表示される（FR-001〜FR-004）。

### 2. 商品一覧へ戻る確認（User Story 3）

1. 手順1の完了画面で「商品一覧へ戻る」リンクをクリックする。
2. **期待結果**: 商品一覧画面（`/`）へ遷移する（FR-005）。

### 3. カートクリアの確認（User Story 3, FR-006）

1. 手順1で注文完了画面が表示された直後、ブラウザの開発者ツールで`localStorage`の`bookstore.cart`を確認する。
2. **期待結果**: カートが空配列になっている（`007`の実装により注文確定API成功直後にクリア済み）。
3. カート画面（`/cart`）を直接開く。
4. **期待結果**: カートの空状態（0件）表示になっている。

### 4. ブラウザ再読み込み時の再表示確認（FR-007, Edge Cases）

1. 手順1の注文完了画面が表示されている状態で、ブラウザを再読み込みする。
2. **期待結果**: 再読み込み後も同一の注文番号・完了メッセージが表示される（`GET /api/orders/:orderNumber`による再取得）。

### 5. 存在しない注文番号でのアクセス確認（FR-008, Edge Cases）

1. `http://localhost:3000/order/complete/00000000000000000000000000` のような、実在しない注文番号を指定してアクセスする。
2. **期待結果**: 商品一覧画面（`/`）へ自動的にリダイレクトされ、完了メッセージ・注文番号は表示されない。

### 6. 注文情報取得APIの直接確認

```bash
# 事前に手順1で控えた実在の注文番号を指定する
curl -i http://localhost:4000/api/orders/<実在の注文番号>
curl -i http://localhost:4000/api/orders/00000000000000000000000000
```

- **期待結果**: 実在の注文番号は`200`で`{ "orderNumber": "<同じ値>" }`、存在しない注文番号は`404`が返る。

## 自動テスト実行

```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test
```

- backend: `orderService.getOrderByNumber`（単体、存在する場合／しない場合）、`GET /api/orders/:orderNumber`（結合、契約テストの観点を含む）の各テストが通ることを確認する。
- frontend: `order/complete/[orderNumber]/page.tsx`（正常表示、取得失敗時のリダイレクト）のテストが通ることを確認する。
