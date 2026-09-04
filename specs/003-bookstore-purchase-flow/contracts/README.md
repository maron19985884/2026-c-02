# API Contracts: 個人運営オンライン書店 購買フロー

**Branch**: `003-bookstore-purchase-flow` | **Date**: 2026-09-03
**Base URL**: `http://localhost:4000`（環境変数 `NEXT_PUBLIC_API_URL`、D-11）
**形式**: REST / JSON（UTF-8）。全レスポンスに `Content-Type: application/json`。

## エンドポイント一覧

| # | メソッド | パス | 用途 | 対応 FR | 契約書 |
|---|---|---|---|---|---|
| 1 | GET | `/api/books` | 販売中書籍のページング一覧 | FR-001, FR-002, FR-004, FR-031 | [books-list.md](books-list.md) |
| 2 | GET | `/api/books/:id` | 書籍1件の詳細 | FR-003, FR-005, FR-008 | [books-detail.md](books-detail.md) |
| 3 | POST | `/api/orders` | 注文の作成（確定） | FR-017〜FR-024a | [orders-create.md](orders-create.md) |
| 4 | GET | `/api/orders/:orderNumber` | （補助）注文番号での照会 | SC-007 支援 | [orders-create.md](orders-create.md#補助-get-apiordersordernumber) |

- カート用エンドポイントは**存在しない**（カートはクライアント `localStorage`、CL-001）。
- 認証なし（FR-025）。全エンドポイントが未認証で利用可能。

## 共通エラー形式

```json
{
  "error": "string（利用者向けの定型メッセージではなく、機械可読な種別。例: \"VALIDATION_ERROR\", \"NOT_FOUND\", \"INTERNAL_ERROR\"）",
  "message": "string（開発者向けの補足。UI には出さない）",
  "fields": { "name": "string", "address": "string", "email": "string", "items": "string" }
}
```

| ステータス | 使用場面 |
|---|---|
| 200 | 取得成功 |
| 201 | 注文作成成功 |
| 400 | リクエスト形式不正 / バリデーション違反（`fields` を含む） |
| 404 | 指定リソースが存在しない（書籍・注文） |
| 500 | サーバ内部エラー |

- フロントは `400`（注文）以外のエラーを**汎用エラー表示**に正規化する（CL-007, D-12）。`fields` を使うのは `POST /api/orders` の `400` のみ。

## CORS

- `Access-Control-Allow-Origin: http://localhost:3000`（環境変数 `FRONTEND_ORIGIN`、ワイルドカード不可、D-11）
- 許可メソッド: `GET, POST, OPTIONS` / 許可ヘッダ: `Content-Type`

## 金額表現

- すべて**円単位の整数**（`number`、小数なし、D-09）。通貨コードは返さない。
