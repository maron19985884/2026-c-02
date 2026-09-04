# Contract: `POST /api/orders`

注文を作成（確定）する。単価・書名・小計・合計は**サーバが `books` の現在値から再計算**し、注文明細にスナップショット保存する。

**対応**: FR-017 / FR-018 / FR-019 / FR-020 / FR-020a / FR-022 / FR-024 / FR-024a ・ CL-003 / CL-005 ・ research D-05 / D-08

---

## Request

```
POST /api/orders
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "山田 太郎",
    "address": "東京都千代田区1-1-1 ○○マンション101",
    "email": "taro@example.com"
  },
  "items": [
    { "bookId": 1, "quantity": 2 },
    { "bookId": 5, "quantity": 1 }
  ]
}
```

| フィールド | 型 | 必須 | 制約 |
|---|---|---|---|
| `customer.name` | string | ✅ | トリム後 1〜255 文字 |
| `customer.address` | string | ✅ | トリム後 1〜1000 文字 |
| `customer.email` | string | ✅ | 1〜255 文字、メール形式（実用的正規表現） |
| `items` | array | ✅ | 1件以上 |
| `items[].bookId` | integer | ✅ | `books` に存在し `status='selling'` |
| `items[].quantity` | integer | ✅ | 1〜99 の整数 |

- `items` 内の `bookId` は重複しない前提（カートで集約済み、CL-002）。重複した場合はサーバが合算して処理する。
- リクエストに**金額は含めない**。含まれていてもサーバは無視する（D-08）。

## Response `201 Created`

```json
{
  "orderNumber": "ORD-01J9Z8K3QN7YB4M2T0V1XRE9AF",
  "orderedAt": "2026-09-03T04:21:07.512Z",
  "customer": {
    "name": "山田 太郎",
    "address": "東京都千代田区1-1-1 ○○マンション101",
    "email": "taro@example.com"
  },
  "items": [
    { "bookId": 1, "title": "吾輩は猫である", "unitPrice": 780, "quantity": 2, "subtotal": 1560 },
    { "bookId": 5, "title": "こころ", "unitPrice": 690, "quantity": 1, "subtotal": 690 }
  ],
  "totalAmount": 2250
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `orderNumber` | string | 注文番号 `ORD-` + ULID(Base32 26文字)。一意（FR-022, CL-003） |
| `orderedAt` | string(ISO 8601) | 注文確定日時（UTC） |
| `customer` | object | 保存した注文者情報（送信値のトリム後） |
| `items[].title` | string | 注文時点の書名スナップショット |
| `items[].unitPrice` | integer | 注文時点の単価スナップショット（円） |
| `items[].subtotal` | integer | `unitPrice × quantity` |
| `totalAmount` | integer | Σ `subtotal`（送料等なし、FR-012） |

- 成功時、フロントは `localStorage` のカートを空にし、注文完了画面へ遷移する（FR-020a, CL-004）。

## Response `400 Bad Request`（バリデーション違反）

注文は**作成されない**（FR-018）。`fields` に項目別メッセージ。

```json
{
  "error": "VALIDATION_ERROR",
  "message": "validation failed",
  "fields": {
    "name": "氏名を入力してください",
    "email": "メールアドレスの形式が正しくありません",
    "items": "カートが空です"
  }
}
```

| `fields` キー | 発生条件 |
|---|---|
| `name` | 未入力 / 空白のみ / 256文字以上 |
| `address` | 未入力 / 空白のみ / 1001文字以上 |
| `email` | 未入力 / 形式不正 / 256文字以上 |
| `items` | 空配列 / `bookId` が非実在 or `unlisted` / `quantity` が範囲外・非整数 |

- フロントの `CheckoutForm` は `fields` のキーを各入力欄のエラー表示にマッピングする（D-12）。それ以外のステータス（404/500/ネットワーク）は汎用エラー表示。

## Response `500 Internal Server Error`

トランザクション失敗、注文番号の一意採番に3回失敗、DB エラーなど。注文は作成されない（ロールバック）。

---

## サーバ処理フロー（D-08）

1. 形式チェック（JSON パース、必須キー、型）
2. `customer` 3項目の検証 → 失敗は `fields` に蓄積
3. `items` の各 `bookId` を `books` から取得（`status='selling'` のみ）→ 非実在/対象外/`quantity` 範囲外は `fields.items`
4. `fields` が非空なら `400`（ここまで副作用なし）
5. `unitPrice = books.price`、`subtotal = unitPrice × quantity`、`totalAmount = Σ subtotal` をサーバ算出
6. `orderNumber` を生成（`ORD-` + ULID→Base32）
7. トランザクション: `INSERT orders` → `INSERT order_items`（複数）→ commit
8. `201` で確定内容を返却

---

## 補助: `GET /api/orders/:orderNumber`

SC-007（後から注文番号で特定できる）を支える参照専用エンドポイント。UI 画面は必須ではないが、結合テストと運用照会のために用意する。

### Request

```
GET /api/orders/{orderNumber}
```

### Response `200 OK`

`POST /api/orders` の `201` と同じ構造（`orderNumber` / `orderedAt` / `customer` / `items` / `totalAmount`）。

### Response `404 Not Found`

```json
{ "error": "NOT_FOUND", "message": "order not found" }
```

---

## 受け入れ観点（テスト）

- [ ] 有効な `customer` ＋ 販売中書籍2件で `201`、`totalAmount` がサーバ再計算と一致
- [ ] `items[].title` / `unitPrice` が注文時点の `books` 値で保存される
- [ ] `name` 空 → `400` かつ `fields.name` あり、注文レコードが作られない
- [ ] `email` に `@` なし → `400` かつ `fields.email`
- [ ] `items: []` → `400` かつ `fields.items`
- [ ] 非実在 `bookId` / `unlisted` の `bookId` → `400` かつ `fields.items`
- [ ] `quantity: 0` / `100` / `1.5` → `400`
- [ ] 連続作成しても `orderNumber` が毎回一意（重複しない、SC-004）
- [ ] リクエストに `unitPrice` や `totalAmount` を含めてもサーバ値で上書きされる
- [ ] 作成した `orderNumber` で `GET /api/orders/:orderNumber` が同一内容を返す
- [ ] 途中失敗時に `orders`/`order_items` いずれも残らない（トランザクション）
