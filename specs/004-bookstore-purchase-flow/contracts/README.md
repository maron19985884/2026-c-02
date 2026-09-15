# API Contracts — オンライン書店の購買フロー

**Branch**: `004-bookstore-purchase-flow` | **Date**: 2026-09-15 | **Plan**: [../plan.md](../plan.md)

バックエンド（Express :4000）がフロントエンド（Next.js :3000）へ提供する REST API の取り決め。
パスは [`tech-stack.md`](../../../tech-stack.md) §7 の規則（ケバブケース・複数形リソース）に従う。

## エンドポイント一覧

| メソッド | パス | 目的 | 契約書 | 対応要件 |
|---|---|---|---|---|
| GET | `/health` | 起動確認（雛形に既存） | — | — |
| GET | `/api/books` | 販売中の書籍一覧を取得 | [books-api.md](./books-api.md) | FR-001, FR-001a, FR-001c, FR-001d, FR-002 |
| GET | `/api/books/:id` | 書籍詳細を取得 | [books-api.md](./books-api.md) | FR-005, FR-005a |
| POST | `/api/orders` | 注文を作成 | [orders-api.md](./orders-api.md) | FR-017〜FR-026 |

**設けないエンドポイント**

| 設けないもの | 理由 |
|---|---|
| カート関連 API（`/api/cart` 等） | カートはブラウザ内に保持しサーバへ永続化しない（research.md D-01 / FR-016a） |
| 注文照会 API（`GET /api/orders/:orderNumber`） | 認証なしで他者の注文を引ける経路になる。FR-029b の趣旨に反する（research.md D-02） |
| 認証・決済・在庫・検索 API | スコープ外（FR-031 / `tech-stack.md` §9） |

## 共通仕様

### ベース URL

フロントエンドは環境変数 `NEXT_PUBLIC_API_URL`（既定 `http://localhost:4000`）を基点に呼び出す。値は `.env` / `docker-compose.yml` から注入し、コードへ直書きしない（`tech-stack.md` §8）。

### CORS

フロント（`:3000`）からの別オリジン呼び出しを許可する（雛形の `cors` ミドルウェアが有効）。

### 文字コード・Content-Type

リクエスト・レスポンスともに `application/json; charset=utf-8`。

### 金額の表現

金額はすべて**整数の日本円**（JSON の数値型）。小数・通貨記号・区切り文字を含めない。表示上の整形はフロントエンドの責務（research.md D-10）。

### エラー応答の形式（research.md D-11）

すべてのエラー応答は以下の形に統一する。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": { }
  }
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `error.code` | string | ○ | 機械判定用のコード（下表） |
| `error.message` | string | ○ | 利用者に提示可能な日本語メッセージ |
| `error.details` | object | — | 項目単位・書籍単位の詳細。code ごとに構造が決まる |

### エラーコード一覧

| HTTP | `code` | 発生条件 | 対応要件 |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | 顧客情報またはカート内容が不正 | FR-018, FR-019, FR-020 |
| 404 | `BOOK_NOT_FOUND` | 書籍が存在しない、または販売停止 | FR-005a |
| 409 | `BOOKS_UNAVAILABLE` | 注文対象に販売停止・削除された書籍が含まれる | FR-016b |
| 500 | `INTERNAL_ERROR` | サーバ内部エラー（DB 接続失敗・トランザクション失敗等） | FR-026 |

エラー応答の本文にスタックトレース・SQL・接続情報を含めない。
