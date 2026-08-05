# Contract: Orders API

## POST /api/orders

注文フォーム画面（User Story 3）で「注文する」を押した際に呼ばれる。カート内容と注文者情報を送信し、注文を確定する。

**Request**
```json
{
  "customerName": "string",
  "address": "string",
  "email": "string",
  "items": [
    { "bookId": 1, "quantity": 2 }
  ]
}
```

**Response 201**（注文完了画面 User Story 4 用）
```json
{
  "orderNumber": "ORD-20260805-0001",
  "createdAt": "2026-08-05T12:00:00.000Z",
  "customerName": "string",
  "items": [
    { "bookId": 1, "title": "string", "price": 1500, "quantity": 2, "subtotal": 3000 }
  ],
  "totalAmount": 3000
}
```

**Response 400**（バリデーションエラー。spec.md FR-013, FR-020）
```json
{
  "error": "VALIDATION_ERROR",
  "fields": {
    "customerName": "REQUIRED",
    "address": "REQUIRED",
    "email": "REQUIRED | INVALID_FORMAT",
    "items": "EMPTY"
  }
}
```
`fields` には実際にエラーとなった項目のみを含める。

**Response 404**（`items`内に存在しない`bookId`が含まれる場合）
```json
{ "error": "BOOK_NOT_FOUND", "bookId": 1 }
```
