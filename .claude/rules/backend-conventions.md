---
description: バックエンドのルート構成・DB スキーマ・TypeScript 規約
globs: ["backend/src/**/*.ts", "mysql/init/*.sql"]
alwaysApply: false
---

## ルート構成 (`backend/src/index.ts`)

全ルートを 1 ファイルに集約。`mysql2/promise` のコネクションプールを使用。

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/health` | ヘルスチェック |
| GET | `/products` | 書籍一覧（`SELECT * FROM books ORDER BY id`） |
| GET | `/products/:id` | 書籍詳細 |
| POST | `/orders` | 注文作成 — ボディ: `{ name, address, email, items: [{book_id, title, price, quantity}] }` — レスポンス: `{ order_number }` |

`POST /orders` はトランザクション内で実行：`orders` へ INSERT 後、各アイテムを `order_items` へ INSERT。注文番号フォーマット: `ORD-${Date.now()}`。

## データベーススキーマ (`mysql/init/01_init.sql`)

- **books**: `id, title, author, price (INT 円), description, image_url, created_at` — 日本語技術書 6 冊の初期データあり
- **orders**: `id, order_number (UNIQUE), name, address, email, total_amount (INT 円), created_at`
- **order_items**: `id, order_id (FK→orders), book_id, title, price, quantity`

スキーマは初回の `docker compose up` 時に 1 度だけ実行される。再実行する場合: `docker compose down -v`。

## TypeScript 規約

- モジュール形式: `commonjs`
- 出力先: `dist/`
- strict モード有効
