# API Contract: 書籍一覧・詳細取得

ベースURL: `http://localhost:4000`（Docker Compose上の`backend`サービス、`requirements.md`の制約条件に準拠）

## GET /api/books

販売中の書籍を一覧取得する（spec.md US1 / FR-001, FR-002, FR-008）。

**Request**: パラメータなし。

**Response 200**:
```json
{
  "books": [
    {
      "id": 1,
      "title": "string",
      "author": "string",
      "price": 1500,
      "coverImageUrl": "string | null"
    }
  ]
}
```

- 並び順: `created_at DESC, id DESC`（登録順・新しい書籍が先頭）
- 販売中の書籍が0件の場合: `{"books": []}`（200、空配列。フロントエンドが空状態メッセージを表示する）

## GET /api/books/:id

指定した書籍の詳細を取得する（spec.md US2 / FR-004, FR-009）。

**Request**: パスパラメータ `id`（number）

**Response 200**:
```json
{
  "id": 1,
  "title": "string",
  "author": "string",
  "price": 1500,
  "description": "string",
  "coverImageUrl": "string | null"
}
```

**Response 404**（存在しない、または`is_for_sale = false`の書籍ID）:
```json
{ "error": "book_not_found" }
```

## 共通エラー方針

- 本機能のAPIは読み取り専用のみで、認証・認可は行わない（匿名アクセス前提、spec.md FR-007）。
- サーバー内部エラー時は500を返す（詳細はログにのみ出力し、レスポンスボディに内部情報を含めない）。
