# API Contract: GET /api/books/:id

商品詳細画面（REQ-004〜006, FR-001〜FR-011）が利用する、書籍単体取得APIの契約。

## エンドポイント

```
GET /api/books/:id
```

- パスパラメータ: `id`（整数。書籍ID）
- クエリパラメータ: なし
- 認証: 不要（未ログイン利用者向け、要件定義書§2）

## 正常系レスポンス

- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Body**: `Book`（`description` を含む全属性）

```json
{
  "id": 1,
  "title": "はじめてのTypeScript",
  "author": "山田太郎",
  "price": 2800,
  "description": "TypeScriptの基礎から実践までを解説する入門書。",
  "imageUrl": "https://example.com/covers/1.jpg"
}
```

### スキーマ

| フィールド | 型 | Null許容 | 説明 |
|---|---|---|---|
| id | integer | 不可 | 書籍ID |
| title | string | 不可 | タイトル |
| author | string | 不可 | 著者名 |
| price | integer | 不可 | 価格（円、税込み。Clarifications Session 2026-09-09） |
| description | string \| null | 可 | 説明文 |
| imageUrl | string \| null | 可 | 書影URL。null/空文字時はフロントエンドが共通プレースホルダーを表示 |

## 異常系レスポンス

### 該当書籍が存在しない場合

- **Status**: `404 Not Found`
- **Body**:

```json
{ "error": "Book not found" }
```

- フロントエンドはこのレスポンスを受けて、商品一覧画面と同一の共通エラー表示（`ErrorNotice`）を表示する。専用の「見つかりません」画面は表示しない（`research.md` D-02、spec.md Clarifications）。

### DBエラー等、取得処理自体が失敗した場合

- **Status**: `500 Internal Server Error`
- **Body**:

```json
{ "error": "Failed to fetch book" }
```

- フロントエンドは404の場合と同様に共通エラー表示（`ErrorNotice`）を表示する（404/500を区別した専用UIは持たない）。

## 契約テストの観点（`tests/integration/booksApi.test.ts` で検証）

1. 存在する `id` を指定して `GET /api/books/:id` を呼ぶと、`description` を含む `Book` オブジェクトが `200` で返る。
2. 存在しない `id`（例: DBに存在しない最大値+1）を指定すると、`404` とエラーボディが返る。
3. `imageUrl` が未設定の書籍は `null`（または空文字）としてそのまま返り、プレースホルダー変換はしない（変換はフロントエンド責務。`004` の D-02 を踏襲）。
4. DBエラー発生時は `500` とエラーボディが返る。
