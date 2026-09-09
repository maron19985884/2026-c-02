# API Contract: POST /api/orders

注文フォーム画面（REQ-012〜015, FR-008〜FR-010）が利用する、注文確定APIの契約。

## エンドポイント

```
POST /api/orders
```

- 認証: 不要（未ログイン利用者向け、要件定義書§2）
- Content-Type: `application/json`

## リクエスト

```json
{
  "customerName": "山田花子",
  "customerAddress": "東京都千代田区1-1-1",
  "customerEmail": "hanako@example.com",
  "items": [
    { "bookId": 1, "quantity": 2 },
    { "bookId": 3, "quantity": 1 }
  ]
}
```

### スキーマ

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| customerName | string | ✓ | 氏名（空文字不可） |
| customerAddress | string | ✓ | 住所（空文字不可） |
| customerEmail | string | ✓ | メールアドレス（`xxx@yyy`形式。空文字不可） |
| items | array | ✓ | 注文明細。1件以上必須（空配列は400） |
| items[].bookId | integer | ✓ | 対象書籍のID |
| items[].quantity | integer | ✓ | 数量（1以上の整数） |

- `items[].bookId`に対応する書籍の単価・書名はサーバー側で`books`テーブルから取得する。リクエストに`price`・`title`を含めても無視する（`research.md` D-02）。
- 詳細な入力形式チェック（メール形式等）はフロントエンドの`validateOrderForm`が主に担当する。本APIは最小限の防御的バリデーションのみ行う（`research.md` D-06）。

## 正常系レスポンス

- **Status**: `201 Created`
- **Content-Type**: `application/json`

```json
{
  "orderNumber": "01J8Z3K9N4Q7R2XABCD5EFGHJK",
  "totalAmount": 8600
}
```

### スキーマ

| フィールド | 型 | 説明 |
|---|---|---|
| orderNumber | string | ULID風・Base32・26文字の注文番号（`research.md` D-01） |
| totalAmount | integer | サーバー側で算出した合計金額（円） |

## 異常系レスポンス

### 400 Bad Request（入力不備）

- 必須項目の欠落・空文字、`items`が空配列、`items[].quantity`が1未満、`items[].bookId`が存在しない書籍IDの場合。

```json
{ "error": "Invalid order request" }
```

### 500 Internal Server Error

- DB接続エラー等、注文作成処理そのものが失敗した場合（トランザクションはロールバックされ、`orders` / `order_items`のいずれにも行は残らない）。

```json
{ "error": "Failed to create order" }
```

- フロントエンドはこれらのレスポンス（または通信エラー）を受けて、入力済みの内容を保持したままエラーメッセージを表示し、注文フォーム画面にとどまる（FR-010）。

## 契約テストの観点（`backend/tests/integration/ordersApi.test.ts` で検証）

1. 有効なリクエストを送ると`201`が返り、`orderNumber`（26文字）と`totalAmount`（`items`の単価×数量の総和、DB上の`books.price`基準）が返る。
2. `orders`テーブルに1行、`order_items`テーブルに`items`の件数分の行が保存される。
3. `customerName` / `customerAddress` / `customerEmail`のいずれかが空文字または未指定の場合、`400`が返り、DBに行は作成されない。
4. `items`が空配列の場合、`400`が返る。
5. `items[].bookId`が存在しない書籍IDを含む場合、`400`が返り、DBに行は作成されない（一部成功は許容しない）。
6. リクエストに`items[].price`や`items[].title`を含めても無視され、`order_items`には`books`テーブルの現在値が保存される。
