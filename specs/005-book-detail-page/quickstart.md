# Quickstart: 商品詳細画面

本機能（`GET /api/books/:id` + 商品詳細画面 + カートに追加）を実装後、以下の手順で動作確認する。

## 前提

- Docker Desktop が起動していること
- `004-book-list-page` が実装済みで、`docker compose up --build` により商品一覧画面が表示できること

## 起動

```bash
docker compose up --build
```

- frontend: http://localhost:3000
- backend: http://localhost:4000

## 検証手順

### 1. バックエンドAPIの疎通確認

```bash
curl http://localhost:4000/api/books/1
```

- **期待結果**: `200 OK`、`description` を含む書籍情報が返る（contracts/books-detail-api.md）。

```bash
curl -i http://localhost:4000/api/books/999999
```

- **期待結果**: `404 Not Found`、`{ "error": "Book not found" }` が返る（FR-009）。

### 2. 商品詳細画面の表示確認（User Story 1）

1. ブラウザで http://localhost:3000 を開き、任意の書籍カードをクリックする。
2. **期待結果**: `/books/[id]` に遷移し、書影（またはプレースホルダー）・タイトル・著者・価格（税込み）・説明文が表示される（FR-001, FR-007）。

### 3. カートに追加の確認（User Story 2）

1. 商品詳細画面で「カートに追加」ボタンを押す。
2. **期待結果**: ボタンの表記が一時的に「追加しました」等に変化し、しばらくすると元の表記に戻る（FR-011）。
3. 同じボタンをもう一度押す。
4. **期待結果**: カート内の当該書籍の数量が2になる（新しい行は増えない、FR-010）。ブラウザの開発者ツールで `localStorage` の `bookstore.cart` を確認し、該当書籍の `quantity` が加算されていることを確認する。

### 4. 一覧へ戻ってもカートが保持されることの確認（User Story 3）

1. 商品詳細画面で「カートに追加」を押した後、「一覧へ戻る」導線から商品一覧画面に戻る（FR-004）。
2. 再度別の書籍の詳細画面を開き、「カートに追加」を押す。
3. `localStorage` の `bookstore.cart` を確認し、直前に追加した書籍と合わせて2種類の書籍がカートに残っていることを確認する（FR-005）。

### 5. 存在しない書籍IDのエラー表示確認（Edge Case）

1. ブラウザで `http://localhost:3000/books/999999` を直接開く。
2. **期待結果**: 商品一覧画面と同一の共通エラー表示（`ErrorNotice`）が表示される（専用の「見つかりません」画面ではない、FR-009）。

## 自動テスト実行

```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test
```

- `bookService.fetchBookById`、`GET /api/books/:id`（結合テスト、200/404/500）、`CartContext`（新規追加・既存加算・上限なし）、`AddToCartButton`（ラベルの一時変化・連打時の加算）の各テストが通ることを確認する。
