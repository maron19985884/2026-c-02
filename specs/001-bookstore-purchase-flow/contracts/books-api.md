# Contract: Books API

## GET /api/books

商品一覧画面（User Story 1）用。販売中の書籍を一覧取得する。

**Response 200**
```json
[
  {
    "id": 1,
    "title": "string",
    "author": "string",
    "price": 1500,
    "imageUrl": "string"
  }
]
```

## GET /api/books/:id

商品詳細画面（User Story 1）用。指定書籍の詳細を取得する。

**Response 200**
```json
{
  "id": 1,
  "title": "string",
  "author": "string",
  "price": 1500,
  "description": "string",
  "imageUrl": "string"
}
```

**Response 404**（該当書籍が存在しない場合）
```json
{ "error": "BOOK_NOT_FOUND" }
```
