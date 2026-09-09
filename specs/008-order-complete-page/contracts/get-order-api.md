# API Contract: GET /api/orders/:orderNumber

注文完了画面（REQ-016〜018, FR-007, FR-008）が利用する、注文情報の再取得APIの契約。

## エンドポイント

```
GET /api/orders/:orderNumber
```

- 認証: 不要（未ログイン利用者向け、要件定義書§2）
- `orderNumber`: URLパスパラメータ。`orders.order_number`と照合する文字列

## 正常系レスポンス

- **Status**: `200 OK`
- **Content-Type**: `application/json`

```json
{
  "orderNumber": "01J8Z3K9N4Q7R2XABCD5EFGHJK"
}
```

### スキーマ

| フィールド | 型 | 説明 |
|---|---|---|
| orderNumber | string | 検索に使用した注文番号（存在確認済み。`research.md` D-01） |

## 異常系レスポンス

### 404 Not Found（該当注文なし）

- 指定された`orderNumber`に一致する`orders`行が存在しない場合。

```json
{ "error": "Order not found" }
```

### 500 Internal Server Error

- DB接続エラー等、検索処理そのものが失敗した場合。

```json
{ "error": "Failed to fetch order" }
```

- フロントエンド（`order/complete/[orderNumber]/page.tsx`）はこれらのレスポンス（`404`・`500`）または通信エラーのいずれの場合も同様に扱い、商品一覧画面（`/`）へリダイレクトする（spec.md FR-008、`research.md` D-02）。エラーの種類による表示の出し分けは行わない。

## 契約テストの観点（`backend/tests/integration/ordersApi.test.ts` で検証）

1. `007`のPOST `/api/orders`で作成済みの注文番号を指定して`GET /api/orders/:orderNumber`を呼ぶと`200`が返り、`orderNumber`が一致する。
2. 存在しない注文番号（例: ランダムな26文字の文字列）を指定すると`404`が返る。
3. レスポンスに`customerName`・`customerAddress`・`customerEmail`・`totalAmount`等、注文番号以外の顧客情報・金額情報が含まれないことを確認する（`research.md` D-01、YAGNI）。
