# API Contract: 注文確定

**Feature**: 003-order-checkout
**Date**: 2026-06-28

## POST /api/orders

注文を確定し、一意の注文番号を返す。

### Request

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "customer_name": "山田 太郎",
  "customer_address": "東京都渋谷区xxx-xxx",
  "customer_email": "yamada@example.com",
  "items": [
    {
      "book_id": 1,
      "quantity": 2,
      "unit_price": 1500
    }
  ]
}
```

| フィールド | 型 | 必須 | バリデーション |
|---|---|---|---|
| customer_name | string | ✅ | 空文字不可 |
| customer_address | string | ✅ | 空文字不可 |
| customer_email | string | ✅ | メール形式（`@` を含む） |
| items | array | ✅ | 1件以上 |
| items[].book_id | number | ✅ | 正の整数 |
| items[].quantity | number | ✅ | 1以上の整数 |
| items[].unit_price | number | ✅ | 0より大きい整数 |

### Response

#### 成功 (201 Created)

```json
{
  "order_number": "ORD-20260628-001234"
}
```

#### バリデーションエラー (400 Bad Request)

```json
{
  "errors": {
    "customer_name": "氏名は必須です",
    "customer_email": "メールアドレスの形式が正しくありません"
  }
}
```

エラーオブジェクトのキーは該当フィールド名。複数フィールドが同時にエラーになる場合はすべて返す。

#### 空カート (422 Unprocessable Entity)

```json
{
  "error": "注文アイテムが1件以上必要です"
}
```

#### サーバーエラー (500 Internal Server Error)

```json
{
  "error": "注文の確定に失敗しました。時間をおいて再度お試しください。"
}
```
