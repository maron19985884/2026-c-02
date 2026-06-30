# API Contracts: オンライン書店 購買フロー

**Feature**: specs/001-purchase-flow
**Date**: 2026-06-30
**Base URL**: `http://localhost:4000`

Types → [api-types.ts](./api-types.ts)

---

## 共通仕様

- **Content-Type**: `application/json`
- **文字コード**: UTF-8
- **レスポンス形式**: フラット JSON（ラッパーなし）
- **エラーレスポンス**: `{ "error": "<message>" }` + 適切な HTTP ステータスコード

### 共通エラー

| ステータス | 意味 | 発生条件 |
|-----------|------|----------|
| 400 | Bad Request | リクエストボディの必須項目欠損・形式不正 |
| 404 | Not Found | 指定IDのリソースが存在しない |
| 500 | Internal Server Error | サーバー内部エラー |

---

## 書籍 API

### GET /books

販売中の書籍一覧を取得する（U-01, U-02）。

**Request**: パラメータなし

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "title": "TypeScriptではじめるWebアプリ開発",
    "author": "山田 太郎",
    "price": 2800,
    "description": "TypeScriptの基礎からNext.js・Expressを使ったフルスタック開発まで解説。",
    "imageUrl": "https://placehold.jp/150x200.png"
  },
  {
    "id": 2,
    "title": "Dockerコンテナ入門",
    "author": "佐藤 花子",
    "price": 3200,
    "description": "Docker・docker-composeの基礎から本番運用まで。",
    "imageUrl": "https://placehold.jp/150x200.png"
  }
]
```

**TypeScript型**: `Book[]`  
**エラー**: 500（DB接続失敗）

---

### GET /books/:id

書籍詳細を1件取得する（U-04）。

**Request**: パラメータなし

| Path param | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | integer | ✅ | 書籍ID |

**Response**: `200 OK`

```json
{
  "id": 1,
  "title": "TypeScriptではじめるWebアプリ開発",
  "author": "山田 太郎",
  "price": 2800,
  "description": "TypeScriptの基礎からNext.js・Expressを使ったフルスタック開発まで解説。",
  "imageUrl": "https://placehold.jp/150x200.png"
}
```

**TypeScript型**: `Book`

**エラー**:

| ステータス | 条件 |
|-----------|------|
| 404 | 指定 id の書籍が存在しない |
| 400 | id が整数でない |

---

## 注文 API

### POST /orders

注文を確定し、注文番号を返す（U-15, U-16）。

**Request Body**:

```json
{
  "customerName": "鈴木 一郎",
  "address": "東京都渋谷区1-1-1",
  "email": "suzuki@example.com",
  "items": [
    {
      "bookId": 1,
      "quantity": 2,
      "unitPrice": 2800
    },
    {
      "bookId": 3,
      "quantity": 1,
      "unitPrice": 1980
    }
  ],
  "totalAmount": 7580
}
```

**TypeScript型**: `CreateOrderRequest`

**バリデーション**:

| フィールド | ルール |
|-----------|--------|
| customerName | 必須、空文字列不可 |
| address | 必須、空文字列不可 |
| email | 必須、`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` 形式 |
| items | 必須、1件以上 |
| items[].bookId | 必須、整数 |
| items[].quantity | 必須、1以上の整数 |
| items[].unitPrice | 必須、1以上の整数 |
| totalAmount | 必須、1以上の整数 |

**Response**: `201 Created`

```json
{
  "orderNumber": "ORD-000001"
}
```

**TypeScript型**: `CreateOrderResponse`

**エラー**:

| ステータス | 条件 |
|-----------|------|
| 400 | 必須フィールド欠損 |
| 400 | email 形式不正 |
| 400 | items が空配列 |
| 500 | DB書き込み失敗 |

---

## フロントエンド API サービス層の責務

フロントエンドでは `frontend/src/services/` 以下に API クライアントを配置し、
全ての HTTP 通信をここに集約する（Constitution Principle II）。

```
frontend/src/services/
├── bookApi.ts    # GET /books, GET /books/:id
└── orderApi.ts   # POST /orders
```

各サービス関数はこのファイルの TypeScript 型を使用し、
`fetch()` の生レスポンスを型付きオブジェクトに変換して返す。
コンポーネントは直接 `fetch()` を呼び出してはならない。
