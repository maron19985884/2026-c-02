# Quickstart: 商品一覧画面

本機能（`GET /api/books` + 商品一覧グリッド表示）を実装後、以下の手順で動作確認する。

## 前提

- Docker Desktop が起動していること
- リポジトリルートに `docker-compose.yml`、`frontend/`、`backend/`、`mysql/init/01_init.sql` が実装済みであること（`plan.md` の Project Structure 参照）

## 起動

```bash
docker compose up --build
```

- frontend: http://localhost:3000
- backend: http://localhost:4000
- mysql: localhost:3306（コンテナ間通信のみで直接接続する想定はなし）

## 検証手順

### 1. バックエンドAPIの疎通確認

```bash
curl http://localhost:4000/api/books
```

- **期待結果**: `200 OK`、`id` 昇順の書籍配列（`mysql/init/01_init.sql` の初期データ件数分）が返る（FR-006, contracts/books-api.md）。

### 2. 商品一覧画面の表示確認（User Story 1, 2）

1. ブラウザで http://localhost:3000 を開く。
2. **期待結果**: 初期データの書籍がグリッド形式で複数冊表示される（FR-001）。
3. 各書籍カードに書影（またはプレースホルダー画像）・タイトル・著者・価格が表示されていることを確認する（FR-002, FR-008）。

### 3. 詳細画面への遷移確認（User Story 3）

1. 一覧の任意の書籍カードをクリックする。
2. **期待結果**: クリックした書籍に対応する商品詳細画面へ遷移する（FR-003）。※商品詳細画面自体は本機能のスコープ外のため、遷移先ルーティングの疎通確認までを対象とする。

### 4. 空状態の確認（Edge Case）

1. `books` テーブルを空にする（例: テスト用DBやシードなしの状態）。
2. ブラウザで一覧画面を開く。
3. **期待結果**: エラーではなく、書籍が0件であることを示す空状態表示（`EmptyState`）が出る（FR-004, SC-004）。

### 5. エラー表示の確認（Edge Case）

1. backend コンテナを停止した状態でフロントエンドの一覧画面を開く（または `GET /api/books` が失敗する状態を作る）。
2. **期待結果**: 共通エラー表示（`ErrorNotice`）が出る。再読み込みボタンなどは表示されない（FR-007）。

## 自動テスト実行

```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test
```

- `bookService`（ソート順）、`GET /api/books`（結合テスト）、`BookGrid` / `BookCard`（表示・空状態・プレースホルダー）の各テストが通ることを確認する。
