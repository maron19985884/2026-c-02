# API Contract: GET /api/books

商品一覧画面（REQ-001〜003, FR-001〜FR-009）が利用する、書籍一覧取得APIの契約。

## エンドポイント

```
GET /api/books
```

- クエリパラメータ: なし（検索・フィルター・ページネーションは対象外。`research.md` D-01）
- 認証: 不要（未ログイン利用者向け、要件定義書§2）

## 正常系レスポンス

- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Body**: `BookListItem` の配列。`id` 昇順（登録順）でソート済み（FR-006）。

```json
[
  {
    "id": 1,
    "title": "はじめてのTypeScript",
    "author": "山田太郎",
    "price": 2800,
    "imageUrl": "https://example.com/covers/1.jpg"
  },
  {
    "id": 2,
    "title": "オンライン書店の作り方",
    "author": "佐藤花子",
    "price": 3200,
    "imageUrl": null
  }
]
```

### スキーマ

| フィールド | 型 | Null許容 | 説明 |
|---|---|---|---|
| id | integer | 不可 | 書籍ID |
| title | string | 不可 | タイトル |
| author | string | 不可 | 著者名 |
| price | integer | 不可 | 価格（円） |
| imageUrl | string \| null | 可 | 書影URL。null/空文字時はフロントエンドが共通プレースホルダーを表示（FR-008） |

### 書籍が0件の場合

- **Status**: `200 OK`
- **Body**: `[]`（空配列。エラーではない。フロントエンドは空状態表示に切り替える、FR-004）

## 異常系レスポンス

- **Status**: `500 Internal Server Error`（DB接続エラー等、取得処理そのものが失敗した場合）
- **Body**:

```json
{ "error": "Failed to fetch books" }
```

- フロントエンドはこのレスポンス（または通信エラー）を受けて共通エラー表示（`ErrorNotice`）を表示する。再試行操作は提供しない（FR-007、`research.md` D-05）。

## 契約テストの観点（`tests/integration/booksApi.test.ts` で検証）

1. 書籍が複数件登録されている状態で `GET /api/books` を呼ぶと、`id` 昇順の配列が返る。
2. 書籍が0件のとき、`200` と空配列 `[]` が返る（エラーにしない）。
3. `imageUrl` が未設定の書籍は `null`（または空文字）としてそのまま返り、プレースホルダー変換はしない（変換はフロントエンド責務）。
4. DBエラー発生時は `500` とエラーボディが返る。
