---
name: project-bookstore
description: 個人運営オンライン書店 購買フロー実装プロジェクトの設計決定事項と確立された規約
metadata:
  type: project
---

## プロジェクト概要

個人運営オンライン書店の購買フロー（商品一覧→商品詳細→カート→注文フォーム→注文完了）を実装するWebアプリ。

**Why:** 個人書店向けのMVP実装。ログイン・決済・在庫管理はスコープ外とすることでコアフローに集中。

**How to apply:** 機能追加提案時は必ずスコープ外リストを確認し、スコープ外機能を設計に含めないようにする。

---

## 確立された設計規約

### APIエンドポイント命名規約

| リソース | パス |
|---|---|
| 商品一覧 | `GET /api/products` |
| 商品詳細 | `GET /api/products/:id` |
| 注文作成 | `POST /api/orders` |
| 注文詳細 | `GET /api/orders/:id` |
| ヘルスチェック | `GET /health` |

- プレフィックスは `/api`
- リソース名は英語複数形（products, orders）
- カートのAPIは設けない（localStorageで管理）

### 画面URL・Appルーターパス規約

| 画面 | URL | src/app/ パス |
|---|---|---|
| 商品一覧 | `/` | `page.tsx` |
| 商品詳細 | `/products/[id]` | `products/[id]/page.tsx` |
| カート | `/cart` | `cart/page.tsx` |
| 注文フォーム | `/order` | `order/page.tsx` |
| 注文完了 | `/order/complete` | `order/complete/page.tsx` |

### DBテーブル命名規約

- テーブル名: スネークケース英語複数形
- 主要テーブル: `products`, `orders`, `order_items`
- 共通カラム: `created_at`, `updated_at`（TIMESTAMP型、main tableのみ）
- `order_items` には `updated_at` を持たない（不変データのため）

### 注文番号フォーマット

`ORD-` + 10桁ゼロ埋めID（例: ORD-0000000001）

### カート管理方針

ブラウザのlocalStorageで管理。サーバーサイドAPI・DBテーブルなし。理由: ログイン機能がスコープ外のため。

### 注文完了画面への注文番号受け渡し

URLクエリパラメータを使用（例: `/order/complete?order_number=ORD-0000000042`）

### order_itemsのスナップショット設計

注文時点のtitle・priceをorder_itemsに複製保存する。商品情報変更後も注文時の内容を正確に保持するため。

---

## スコープ外機能（明示的に含めない）

- ログイン・会員管理
- 決済処理
- 在庫管理
- 管理画面
- レビュー・評価
- 検索・フィルター
- 送料計算
- メール送信
- 複数デバイスのカート同期

---

## 主要な前提条件（曖昧要件への対応）

| 前提ID | 内容 |
|---|---|
| [前提A] | カートはlocalStorage管理、カートAPI・DBテーブルなし |
| [前提B] | 数量「−」は1のとき非活性（0への変更・自動削除なし） |
| [前提C] | 注文確認メール送信はスコープ外。アドレスはDB保存のみ |
| [前提D] | 注文番号受け渡しはURLクエリパラメータ |
| [前提E] | スマホ・タブレットのレスポンシブ対応はMVP必須外 |
| [前提F] | 価格はすべて税込み表示、税率計算なし |
| [前提G] | 注文番号フォーマット: ORD-0000000001 |
