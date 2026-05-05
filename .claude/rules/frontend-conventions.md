---
description: フロントエンドのコンポーネント・スタイル規約、API・画面構成
globs: ["frontend/src/**/*.tsx"]
alwaysApply: false
---

## 画面遷移フロー

```
商品一覧 (/) → 商品詳細 (/products/[id]) → カート (/cart) → 注文フォーム (/order) → 注文完了 (/order/complete)
```

## バックエンド API（ベース URL: `NEXT_PUBLIC_API_URL`）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/products` | 書籍一覧 |
| GET | `/products/:id` | 書籍詳細 |
| POST | `/orders` | 注文作成 — ボディ: `{ name, address, email, items: [{book_id, title, price, quantity}] }` — レスポンス: `{ order_number }` |

## 状態管理

`CartContext` (`src/contexts/CartContext.tsx`) がアプリ全体をラップ（`Providers.tsx` 経由）。カートは `localStorage` に永続化。
公開メンバー: `items, addItem, updateQuantity, removeItem, clearCart, total`

共有型定義 (`src/types/index.ts`): `Book`（API レスポンス）、`CartItem`（`Book` に `quantity` を追加）

## ページ一覧

- `page.tsx` — 書籍カードのグリッド（`/products` を fetch）
- `products/[id]/page.tsx` — 書籍詳細 +「カートに追加」ボタン
- `cart/page.tsx` — 数量変更・削除テーブル、`/order` へのリンク
- `order/page.tsx` — 配送先フォーム（氏名・住所・メール、バリデーションあり）＋注文サマリーの 2 カラム。`POST /orders` 後にリダイレクト
- `order/complete/page.tsx` — クエリパラメータ `?orderNumber=` から注文番号を表示

## コンポーネント規約

- すべてのページコンポーネントは `"use client"` ディレクティブを先頭に付ける

## スタイル規約

- スタイルはすべてインラインスタイル（`style={{...}}`）で記述する
- CSS モジュール・Tailwind・外部 CSS フレームワークは使用しない
- カラーパレット:
  - メインネイビー: `#1e3a8a` / `#1e40af`
  - ページ背景グレー: `#f3f4f6`
  - カード背景: `white` + `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
  - テキスト（本文）: `#111827` / `#374151`
  - テキスト（サブ）: `#6b7280`
  - エラー・削除: `#ef4444`
