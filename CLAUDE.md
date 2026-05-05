# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う際に Claude Code (claude.ai/code) へ提供するガイダンスです。

## プロジェクト概要

購買フロー一式を備えた日本語オンライン書店アプリ。Docker サービスは 3 つ：

| サービス | スタック | ポート |
|---|---|---|
| frontend | Next.js 14 + TypeScript | 3000 |
| backend | Express.js + TypeScript | 4000 |
| mysql | MySQL 8 | 3306 |

## セットアップ

```bash
cp .env.example .env
docker compose up --build
```

動作確認：
- フロントエンド: http://localhost:3000
- バックエンド health: http://localhost:4000/health
- MySQL: `docker compose exec mysql mysql -u appuser -ppassword appdb`

2 回目以降の起動: `docker compose up` | 停止: `docker compose down`

## 開発コマンド

開発作業はすべて Docker コンテナ内で実行する。ホスト上で直接コマンドを実行する場合は、先に該当ディレクトリへ `cd` すること。

**バックエンド** (`backend/`):
```bash
npm run dev    # ts-node-dev によるホットリロード（コンテナ内で使用）
npm run build  # tsc → dist/
npm start      # node dist/index.js
```

**フロントエンド** (`frontend/`):
```bash
npm run dev    # next dev
npm run build  # next build
npm start      # next start
```

## アーキテクチャ

### 画面遷移フロー
```
商品一覧 (/) → 商品詳細 (/products/[id]) → カート (/cart) → 注文フォーム (/order) → 注文完了 (/order/complete)
```

### バックエンド API (`backend/src/index.ts`)

全ルートを 1 ファイルに集約し、`mysql2/promise` のコネクションプールを使用：

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/health` | ヘルスチェック |
| GET | `/products` | 書籍一覧（`SELECT * FROM books ORDER BY id`） |
| GET | `/products/:id` | 書籍詳細 |
| POST | `/orders` | 注文作成 — リクエストボディ: `{ name, address, email, items: [{book_id, title, price, quantity}] }` — レスポンス: `{ order_number }` |

`POST /orders` はトランザクション内で実行：`orders` へ INSERT 後、各アイテムを `order_items` へ INSERT。注文番号フォーマット: `ORD-${Date.now()}`。

### データベーススキーマ (`mysql/init/01_init.sql`)

- **books**: `id, title, author, price (INT 円), description, image_url, created_at` — 日本語技術書 6 冊の初期データあり
- **orders**: `id, order_number (UNIQUE), name, address, email, total_amount (INT 円), created_at`
- **order_items**: `id, order_id (FK→orders), book_id, title, price, quantity`

スキーマは初回の `docker compose up` 時に 1 度だけ実行される。再実行する場合: `docker compose down -v`。

### フロントエンド (`frontend/src/`)

**状態管理**: `CartContext` (`src/contexts/CartContext.tsx`) — `Providers.tsx` を通じてアプリ全体をラップする React コンテキスト。カートの内容は `localStorage` に永続化される。公開するメンバー: `items, addItem, updateQuantity, removeItem, clearCart, total`。

**共有型定義** (`src/types/index.ts`): `Book`（API レスポンス用）と `CartItem`（カート内アイテム、`quantity` を追加）。

**ページ一覧** — すべて `"use client"` コンポーネントで、CSS フレームワークなしのインラインスタイルを使用：
- `page.tsx` — `/products` から取得した書籍カードのグリッド表示
- `products/[id]/page.tsx` — 書籍詳細と「カートに追加」ボタン
- `cart/page.tsx` — 数量変更・削除機能付きのテーブル。`/order` へのリンクあり
- `order/page.tsx` — 2 カラムレイアウト：配送先フォーム（氏名・住所・メール、バリデーションあり）＋注文サマリー。`/orders` へ POST 後にリダイレクト
- `order/complete/page.tsx` — クエリパラメータ `?orderNumber=` から注文番号を表示

**スタイル規約**: すべてインラインスタイル（`style={{...}}`）。カラーパレット: ネイビー `#1e3a8a`/`#1e40af`、グレー背景 `#f3f4f6`、カードは白 + `box-shadow`。

### サービス間通信

- バックエンド → MySQL: `mysql:3306`（Docker ネットワーク `app-network`）
- ブラウザ → バックエンド: `NEXT_PUBLIC_API_URL`（デフォルト `http://localhost:4000`）

### 主要な環境変数

`.env`（`.env.example` からコピー）で定義：

| 変数名 | デフォルト値 | 使用サービス |
|---|---|---|
| `DB_NAME` | appdb | backend, mysql |
| `DB_USER` | appuser | backend, mysql |
| `DB_PASSWORD` | password | backend, mysql |
| `MYSQL_ROOT_PASSWORD` | rootpassword | mysql |
| `NEXT_PUBLIC_API_URL` | http://localhost:4000 | frontend（ブラウザ） |

## TypeScript 設定メモ

- バックエンド: `commonjs` モジュール、`dist/` へ出力、strict モード
- フロントエンド: Next.js バンドラー解決、パスエイリアス `@/*` → `src/*`、strict モード
