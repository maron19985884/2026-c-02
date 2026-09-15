# Contract: Orders API

**Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md) | **共通仕様**: [README.md](./README.md)

---

## `POST /api/orders`

注文を確定する。注文フォーム画面の「注文する」押下（FR-022）で呼び出す。

このエンドポイントは以下を1回の呼び出しで行う。

1. 顧客情報とカート内容のバリデーション（FR-017〜FR-020）
2. 対象書籍の実在・販売状態の確認（FR-016b）
3. **サーバ側での金額算出**（クライアントが送った金額を信用しない）
4. 注文番号の発行（FR-023 / D-03）
5. `orders` / `order_items` への単一トランザクション INSERT（FR-024, FR-025 / D-08）

### Request

```http
POST /api/orders HTTP/1.1
Host: localhost:4000
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "小林 景大",
    "address": "東京都千代田区丸の内1-1-1",
    "email": "kobayashi@example.com"
  },
  "items": [
    { "bookId": 1, "quantity": 2 },
    { "bookId": 5, "quantity": 1 }
  ]
}
```

| フィールド | 型 | 必須 | 制約 | 対応要件 |
|---|---|---|---|---|
| `customer.name` | string | ○ | 1〜100文字。空白のみは不可 | FR-017, FR-018 |
| `customer.address` | string | ○ | 1〜255文字。空白のみは不可 | FR-017, FR-018 |
| `customer.email` | string | ○ | 1〜255文字。ローカル部・`@`・ドメイン部の形式を満たす | FR-017, FR-019 |
| `items` | array | ○ | 1要素以上 | FR-014（0件では注文させない） |
| `items[].bookId` | number | ○ | 正の整数 | — |
| `items[].quantity` | number | ○ | 1以上の整数。上限なし | FR-011, FR-011a, FR-011b |

**金額を受け取らない**。合計金額はサーバが `books.price` から算出する。クライアントの送信値を信用すると価格を改ざんできるため（FR-024）。

**同一 `bookId` は1要素まで**。重複時は `VALIDATION_ERROR` とする（FR-009 によりカート側で1書籍1行が保証されているため）。

### Response 201

```json
{
  "order": {
    "orderNumber": "01K59Z4M8QX3V7TPB2NHRG6WDC",
    "totalAmount": 2420,
    "items": [
      { "title": "吾輩は猫である", "unitPrice": 880, "quantity": 2, "subtotal": 1760 },
      { "title": "銀河鉄道の夜", "unitPrice": 660, "quantity": 1, "subtotal": 660 }
    ]
  }
}
```

| フィールド | 型 | 説明 | 対応要件 |
|---|---|---|---|
| `order.orderNumber` | string | 注文番号（ULID 形式・Base32・26文字） | FR-023, FR-028 |
| `order.totalAmount` | number | 確定した合計金額（円・整数） | FR-013, FR-024 |
| `order.items[]` | array | 注文時点のスナップショット | FR-024 |

**`orders.id`（内部 ID）を返さない**。外部に見せる識別子は `orderNumber` のみ（FR-029b / data-model.md §3.2）。

フロントエンドはこの応答を `sessionStorage` に一時保存して注文完了画面へ渡し、同画面はマウント時に読み出して即削除する（research.md D-02 / FR-029a, FR-029b）。

### 振る舞いの取り決め

| 規則 | 対応要件 |
|---|---|
| 合計金額は `SUM(books.price × quantity)` をサーバが算出する | FR-013, FR-024 |
| `order_items.title` / `unit_price` は確定時の `books` の値をコピーする | FR-024, SC-006 |
| `orders` INSERT → `order_items` INSERT → COMMIT を単一トランザクションで実行する | FR-025, FR-026 / D-08 |
| 途中で失敗した場合は ROLLBACK し、部分的な注文を残さない | FR-026 / D-08 |
| エラー時はカートを空にしない（クライアント側の責務） | FR-022b |
| 成功時のみクライアントがカートを空にする | FR-022a |

### Errors

#### 400 `VALIDATION_ERROR`（FR-018, FR-019, FR-020）

どの項目がなぜ不正かを `details.fields` で返す。フロントは項目ごとのエラー表示に用いる。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "fields": {
        "name": "REQUIRED",
        "email": "INVALID_FORMAT"
      }
    }
  }
}
```

| `details.fields` のキー | 値 | 意味 |
|---|---|---|
| `name` / `address` / `email` | `REQUIRED` | 未入力（空白のみを含む） |
| `name` / `address` / `email` | `TOO_LONG` | 最大長超過 |
| `email` | `INVALID_FORMAT` | 形式不正 |
| `items` | `EMPTY` | 0件（FR-014） |
| `items` | `INVALID_QUANTITY` | 数量が1未満または整数でない |
| `items` | `DUPLICATE_BOOK` | 同一 `bookId` が複数含まれる |

#### 409 `BOOKS_UNAVAILABLE`（FR-016b）

注文対象に販売停止・削除された書籍が含まれる場合。**注文全体を確定しない**（Edge Cases）。

```json
{
  "error": {
    "code": "BOOKS_UNAVAILABLE",
    "message": "ご注文いただけない書籍が含まれています",
    "details": {
      "unavailableBookIds": [5]
    }
  }
}
```

フロントは該当書籍を画面上で特定できる形で提示し、カートから取り除く導線を示す（FR-016b）。

#### 500 `INTERNAL_ERROR`（FR-026）

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "注文を確定できませんでした。時間をおいて再度お試しください"
  }
}
```

注文完了画面へ遷移させず、入力内容とカート内容を保持したままエラーを表示する（FR-020, FR-022b, FR-026）。

---

## バリデーション規則の共有

FR-018〜FR-020 により、フロントエンドは送信前に同じ検証を行いエラーを表示する。
フロント（`frontend/src/lib/validateOrderForm.ts`）とバックエンド（`backend/src/domain/validateOrderRequest.ts`）は
**同一の規則**を実装し、それぞれ単体テストを持つ（SC-008 / research.md D-11）。

| 項目 | 規則 |
|---|---|
| 氏名 | 必須。前後の空白を除いて1文字以上、100文字以内 |
| 住所 | 必須。前後の空白を除いて1文字以上、255文字以内 |
| メールアドレス | 必須。前後の空白を除いて1文字以上、255文字以内。ローカル部・`@`・ドメイン部（ドットを含む）の構造を満たす。実在確認は行わない（spec.md Assumptions） |
| 明細 | 1件以上。各 `quantity` は1以上の整数。`bookId` の重複なし |

バックエンドは最終防衛線であり、フロントの検証を通過した前提に立たない。
