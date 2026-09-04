# Contract: `GET /api/books`

販売中（`status='selling'`）の書籍を id 昇順でページングして返す。

**対応**: FR-001 / FR-002 / FR-004 / FR-031 ・ CL-006 ・ research D-04

---

## Request

```
GET /api/books?page={page}&pageSize={pageSize}
```

| クエリ | 型 | 必須 | 既定 | 制約 | 説明 |
|---|---|---|---|---|---|
| `page` | integer | 任意 | `1` | `>= 1`。`> totalPages` の場合は最終ページに丸めて応答（`page` は実際に返した値） | ページ番号（1始まり） |
| `pageSize` | integer | 任意 | `12` | `1..48`。範囲外は 400 | 1ページ件数 |

- ボディなし。認証なし。

## Response `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "title": "吾輩は猫である",
      "author": "夏目 漱石",
      "price": 780,
      "coverImageUrl": "/images/books/1.jpg"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 25,
  "totalPages": 3
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `items` | array<BookSummary> | 当該ページの書籍。0件なら空配列（`totalItems=0` のとき空状態表示＝FR-004） |
| `items[].id` | integer | 書籍ID |
| `items[].title` | string | タイトル |
| `items[].author` | string | 著者 |
| `items[].price` | integer | 価格（円・整数） |
| `items[].coverImageUrl` | string | 書影 URL |
| `page` | integer | 実際に返したページ番号（丸め後） |
| `pageSize` | integer | 1ページ件数 |
| `totalItems` | integer | 販売中書籍の総数 |
| `totalPages` | integer | 総ページ数（`ceil(totalItems / pageSize)`、0件なら 0） |

- `description` は**含めない**（一覧では不要。詳細 API で取得）。
- `status='unlisted'` の書籍は `items` に含めず `totalItems` にも数えない。

## Response `400 Bad Request`

`pageSize` が範囲外、`page`/`pageSize` が整数でない等。

```json
{ "error": "VALIDATION_ERROR", "message": "pageSize must be between 1 and 48" }
```

## Response `500 Internal Server Error`

DB 接続失敗など。フロントは汎用エラー表示（CL-007）。

```json
{ "error": "INTERNAL_ERROR", "message": "..." }
```

---

## 受け入れ観点（テスト）

- [ ] 既定（クエリなし）で `page=1, pageSize=12` として最大12件返る
- [ ] `totalItems`/`totalPages` が販売中書籍数と一致する（`unlisted` を除外）
- [ ] `page=999`（範囲外）で最終ページの `items` と丸めた `page` が返る
- [ ] `pageSize=0` / `pageSize=100` で `400`
- [ ] 販売中0件で `items=[]`, `totalItems=0`, `totalPages=0`
- [ ] レスポンスに `description` が含まれない
