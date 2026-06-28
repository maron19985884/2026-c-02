# API Contract: 書籍API

**Feature**: 001-purchase-flow
**Date**: 2026-06-28

---

## GET /api/books

販売中の書籍一覧を取得する。

### Request

パラメータなし。

### Response (200 OK)

```json
[
  {
    "id": 1,
    "title": "TypeScriptではじめるWebアプリ開発",
    "author": "山田 太郎",
    "price": 2800,
    "image_url": "/images/books/001.jpg"
  },
  {
    "id": 2,
    "title": "Next.js実践ガイド",
    "author": "田中 花子",
    "price": 3200,
    "image_url": "/images/books/002.jpg"
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| id | number | 書籍ID |
| title | string | 書籍タイトル |
| author | string | 著者名 |
| price | number | 税込価格（円） |
| image_url | string \| null | 書影画像URL |

---

## GET /api/books/:id

指定IDの書籍詳細を取得する。

### Request

**Path Parameter**: `id` — 書籍ID（正の整数）

### Response (200 OK)

```json
{
  "id": 1,
  "title": "TypeScriptではじめるWebアプリ開発",
  "author": "山田 太郎",
  "price": 2800,
  "description": "TypeScriptの基礎からNext.jsを使ったWebアプリ開発まで丁寧に解説します。",
  "image_url": "/images/books/001.jpg"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| id | number | 書籍ID |
| title | string | 書籍タイトル |
| author | string | 著者名 |
| price | number | 税込価格（円） |
| description | string \| null | 書籍説明文 |
| image_url | string \| null | 書影画像URL |

### Response (404 Not Found)

```json
{
  "error": "書籍が見つかりません"
}
```
