# Quickstart: 個人運営オンライン書店 購買フロー

**Branch**: `003-bookstore-purchase-flow` | **Date**: 2026-09-03
**対象**: この機能をローカルで起動し、購買フローを一通り検証する手順

---

## 前提

- Docker Desktop（Windows）が動作していること（`tech-stack.md` §2）
- リポジトリのルートに `frontend/` `backend/` `mysql/` `docker-compose.yml` があること（main 由来の雛形実装）
- Node/npm はホストに不要（コンテナ内で実行）。ホスト直実行する場合のみ Node 20 LTS

## 1. 環境変数

`.env.example` をコピーして `.env` を作成し、必要なら値を調整する。

```bash
cp .env.example .env
```

`docker-compose.yml` が参照する主なキー: `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `MYSQL_ROOT_PASSWORD`。
バックエンドは追加で `FRONTEND_ORIGIN`（既定 `http://localhost:3000`）を使う（D-11）。

## 2. スキーマ・シードの配置

`/speckit.implement` で以下が生成される。初回 `docker compose up` 時に MySQL コンテナが自動適用する。

- `mysql/init/001_schema.sql` … `books` / `orders` / `order_items` の CREATE（[data-model.md](data-model.md)）
- `mysql/init/002_seed_books.sql` … デモ用書籍 20〜30 件（`selling` 中心＋`unlisted` 数件）

> すでに `mysql_data` ボリュームが作成済みの場合、init SQL は再実行されない。作り直すには `docker compose down -v` でボリュームごと削除してから起動する。

## 3. 起動

```bash
docker compose up --build
```

- frontend: http://localhost:3000
- backend:  http://localhost:4000
- mysql:    localhost:3306

## 4. 動作確認（API）

```bash
# 一覧（1ページ目・12件）
curl "http://localhost:4000/api/books?page=1&pageSize=12"

# 詳細
curl "http://localhost:4000/api/books/1"

# 注文作成
curl -X POST "http://localhost:4000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"山田 太郎","address":"東京都千代田区1-1-1","email":"taro@example.com"},"items":[{"bookId":1,"quantity":2}]}'

# 注文照会（上で返った orderNumber を使う）
curl "http://localhost:4000/api/orders/ORD-XXXXXXXXXXXXXXXXXXXXXXXXXX"
```

期待:
- 一覧は `items/page/pageSize/totalItems/totalPages` を返し、`unlisted` を含まない
- 詳細は `description` を含む。存在しない id は `404`
- 注文作成は `201` で `orderNumber` と `totalAmount`（サーバ再計算）を返す
- `name` を空にすると `400` かつ `fields.name`

## 5. 動作確認（画面 / 受け入れシナリオ）

ブラウザで http://localhost:3000 を開き、[spec.md](spec.md) の受け入れシナリオを順に確認する。

| # | 操作 | 期待 | 対応 |
|---|---|---|---|
| 1 | トップ（商品一覧）を開く | 販売中書籍がグリッド表示、各カードに書影・タイトル・著者・価格。ページング操作あり | US1-1, FR-001/002/031 |
| 2 | 書籍カードをクリック | 商品詳細へ遷移、書影・タイトル・著者・価格・説明文 | US1-2, FR-003/005 |
| 3 | 「カートに追加」→「一覧へ戻る」 | カートに1件入り、一覧へ戻れる。同じ本をもう一度追加すると数量が2になる | US1-3, FR-006/007, CL-002 |
| 4 | カート画面を開く | 書名・単価・数量・小計・合計が表示 | US1-4, FR-009/012 |
| 5 | 数量を増減／削除 | 小計・合計が即時更新。全削除でカートが空表示 | US2, FR-010/011/015 |
| 6 | ページをリロード | カートの中身が保持されている | CL-001, FR-029 |
| 7 | 「注文手続きへ」 | 注文フォームへ遷移、同画面に注文商品と合計 | US1-5, FR-013/019 |
| 8 | 氏名だけ空で「注文する」 | 氏名エラー表示、遷移しない | US3-1, FR-018 |
| 9 | メールを `abc` にして「注文する」 | メール形式エラー、遷移しない | US3-3, FR-018 |
| 10 | 3項目を正しく入力して「注文する」 | 注文完了画面へ。完了メッセージ＋注文番号＋一覧へ戻るリンク | US1-6/7, FR-020/021/022/023 |
| 11 | 注文完了後にカートを見る | カートが空 | FR-020a, CL-004 |
| 12 | 完了画面で戻る操作→再度「注文する」 | カートが空のため確定できない | Edge Cases |
| 13 | backend を停止して一覧を開く | 「読み込みに失敗しました」等の汎用エラー表示（再試行ボタンなし） | CL-007, FR-032 |

## 6. テスト実行

```bash
# バックエンド（ユニット＋結合）
docker compose exec backend npm test

# フロントエンド（ユニット＋コンポーネント）
docker compose exec frontend npm test
```

- カバレッジ 80% しきい値（憲法 §2 / D-07）。主対象: `lib/cartTotal`, `lib/validation`, `backend/src/domain/*`, `orderService`。

## 7. Lint

```bash
docker compose exec backend npm run lint
docker compose exec frontend npm run lint
```

- エラー0件必須（憲法 §1 / `.github/workflows/quality-gate.yml`）。
- ※ ルート `package.json` 経由の一括 lint は plan.md Complexity Tracking の対応事項（人間）。

## 8. 停止 / クリーンアップ

```bash
docker compose down          # コンテナ停止
docker compose down -v       # DB ボリュームも削除（シード再適用したいとき）
```
