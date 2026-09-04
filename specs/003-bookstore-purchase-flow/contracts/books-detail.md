# Contract: `GET /api/books/:id`

書籍1件の詳細（説明文を含む）を返す。

**対応**: FR-003 / FR-005 / FR-008 ・ Edge Cases「存在しない書籍の詳細画面」

---

## Request

```
GET /api/books/{id}
```

| パスパラメータ | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | integer | `>= 1` の整数。非整数は 400 | 書籍ID |

- ボディなし。認証なし。

## Response `200 OK`

```json
{
  "id": 1,
  "title": "吾輩は猫である",
  "author": "夏目 漱石",
  "price": 780,
  "coverImageUrl": "/images/books/1.jpg",
  "description": "中学校の英語教師・珍野苦沙弥のもとに飼われる猫の視点で描かれる長編小説。"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | integer | 書籍ID |
| `title` | string | タイトル |
| `author` | string | 著者 |
| `price` | integer | 価格（円・整数） |
| `coverImageUrl` | string | 書影 URL |
| `description` | string | 説明文（空文字の場合あり） |

- `status='selling'` の書籍のみ `200`。`status='unlisted'` は `404` として扱う（一覧に出ないものの詳細を直リンクで開けないようにする）。

## Response `404 Not Found`

`id` の書籍が存在しない、または `unlisted`。

```json
{ "error": "NOT_FOUND", "message": "book not found" }
```

- フロントは詳細画面で「この書籍は見つかりませんでした」＋「商品一覧へ戻る」リンクを表示（FR-008）。

## Response `400` / `500`

- `400`: `id` が整数でない。
- `500`: DB エラー等（汎用エラー表示）。

---

## 受け入れ観点（テスト）

- [ ] 実在する販売中書籍で全フィールド（`description` 含む）が返る
- [ ] 存在しない `id` で `404`（`error: "NOT_FOUND"`）
- [ ] `unlisted` の書籍 `id` で `404`
- [ ] `id=abc` で `400`
