# API Contract: 注文確定

ベースURL: `http://localhost:4000`（Docker Compose上の`backend`サービス、`requirements.md`の制約条件に準拠）

## POST /api/orders

顧客情報とカート内容から注文を確定し、永続化する（spec.md US2 / FR-002〜FR-008）。

**Request**:
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

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `customerName` | string | ○ | 氏名。空文字列不可 |
| `address` | string | ○ | 住所。空文字列不可 |
| `email` | string | ○ | メールアドレス。`local@domain`の基本構造が必要（research.md #5） |
| `items` | array | ○ | 1件以上。カート内の販売可能な項目のみを送信する（`isAvailable = false`の項目は含めない） |
| `items[].bookId` | number | ○ | 書籍ID |
| `items[].quantity` | number | ○ | 数量。1以上の整数 |

書名・単価はリクエストに含めない。バックエンドが`books`テーブルから取得し、注文明細のスナップショットとして保存する（research.md #2）。

**Response 201**:
```json
{
  "orderNumber": "ORD-000001",
  "totalAmount": 5200,
  "items": [
    { "bookId": 1, "title": "string", "price": 2600, "quantity": 2, "subtotal": 5200 }
  ]
}
```

**Response 400**（バリデーションエラー）:
```json
{ "error": "validation_error", "details": ["customerName is required", "email format is invalid"] }
```

発生条件:
- `customerName` / `address` / `email` のいずれかが未入力または空文字列（FR-003）
- `email` の形式が不正（FR-004）
- `items` が空配列（カートが空の状態での注文確定、FR-010）

**Response 400**（注文不可な書籍を含む）:
```json
{ "error": "unavailable_items", "bookIds": [3, 7] }
```

発生条件: `items`に含まれる`bookId`が存在しないか、`is_for_sale = 0`（research.md #3）。

**Response 500**（サーバー内部エラー）:
```json
{ "error": "internal_server_error" }
```

## 共通仕様

| 項目 | 内容 |
|---|---|
| データ形式 | `application/json`（002・003と同一） |
| 認証方式 | なし。注文確定は匿名の利用者として行える（spec.mdの前提、ログイン・会員管理は対象外） |
| バリデーション実施箇所 | フロントエンド（即時フィードバック）とバックエンド（信頼境界での防御）の両方（research.md #5） |
| トランザクション | `orders`・`order_items`への書き込みは単一トランザクションで行う（research.md #4）。一部失敗時は全体をロールバックし、`orders`行が部分的に残ることはない |
