# Contract: Books API

**Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md) | **共通仕様**: [README.md](./README.md)

---

## `GET /api/books`

販売中の書籍を**全件**取得する。商品一覧画面（FR-001, FR-002）と、カート画面での価格取得・販売状態の突き合わせ（FR-016b）に用いる。

### Request

パラメータなし。ページング・検索・並べ替えのパラメータは受け付けない（FR-001c / FR-031）。

```http
GET /api/books HTTP/1.1
Host: localhost:4000
```

### Response 200

```json
{
  "books": [
    {
      "id": 1,
      "title": "吾輩は猫である",
      "author": "夏目漱石",
      "price": 880,
      "coverImageUrl": "https://example.com/covers/1.jpg"
    },
    {
      "id": 2,
      "title": "銀河鉄道の夜",
      "author": "宮沢賢治",
      "price": 660,
      "coverImageUrl": null
    }
  ]
}
```

| フィールド | 型 | NULL | 説明 |
|---|---|---|---|
| `books` | array | — | 販売中の書籍。0件のときは空配列（エラーにしない・FR-004） |
| `books[].id` | number | — | 書籍 ID |
| `books[].title` | string | — | タイトル |
| `books[].author` | string | — | 著者 |
| `books[].price` | number | — | 価格（税込・円・整数） |
| `books[].coverImageUrl` | string \| null | ○ | 書影 URL。null のとき代替表示（Edge Cases） |

**`description` を含めない**。一覧では表示しないため（FR-002）。詳細取得で返す。

### 振る舞いの取り決め

| 規則 | 対応要件 |
|---|---|
| `is_available = TRUE` の書籍のみを返す | FR-001a |
| 全件を返す（件数で区切らない） | FR-001c |
| `id` 昇順で返す。同じデータに対して順序が変わらない | FR-001d / D-05 |
| 該当0件でも 200 と空配列を返す（404 にしない） | FR-004 |

### Errors

| HTTP | code | 条件 |
|---|---|---|
| 500 | `INTERNAL_ERROR` | DB 接続・クエリ失敗 |

---

## `GET /api/books/:id`

書籍1冊の詳細を取得する。商品詳細画面（FR-005）に用いる。

### Request

```http
GET /api/books/1 HTTP/1.1
Host: localhost:4000
```

| パラメータ | 位置 | 型 | 説明 |
|---|---|---|---|
| `id` | path | number | 書籍 ID |

### Response 200

```json
{
  "book": {
    "id": 1,
    "title": "吾輩は猫である",
    "author": "夏目漱石",
    "price": 880,
    "description": "中学校の英語教師である珍野苦沙弥の家に住み着いた猫の視点から……",
    "coverImageUrl": "https://example.com/covers/1.jpg"
  }
}
```

一覧のフィールドに加えて `description`（string・必須）を返す（FR-005）。

### 振る舞いの取り決め

| 規則 | 対応要件 |
|---|---|
| `is_available = FALSE` の書籍は 404 を返す（内容を返さない） | FR-005a |
| 存在しない `id` も 404 を返す | Edge Cases |
| 販売停止と不存在を**同じ 404・同じ code** で返す | FR-005a（「該当の書籍を閲覧できない」と統一。存在の有無を外部に漏らさない） |
| `id` が数値として解釈できない場合も 404 を返す | Edge Cases |

### Errors

| HTTP | code | 条件 | 画面の挙動 |
|---|---|---|---|
| 404 | `BOOK_NOT_FOUND` | 不存在・販売停止・`id` 不正 | 「該当の書籍が見つかりません」と商品一覧へ戻る導線を表示（FR-005a） |
| 500 | `INTERNAL_ERROR` | DB 接続・クエリ失敗 | 共通エラー表示（FR-030） |

```json
{
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "該当の書籍が見つかりません"
  }
}
```
