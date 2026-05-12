---
name: implementation-patterns
description: バックエンド/フロントエンドの実装パターン・注意点（DB接続、SSR/CSR混在、トランザクション等）
metadata:
  type: project
---

## バックエンドパターン

### DB接続
- `pool.ts` から `pool` をインポートして使用する
- トランザクションは `pool.getConnection()` でコネクションを取得し、finally節で `connection.release()` を呼ぶ
- クエリは `pool.query<mysql.RowDataPacket[]>(sql, params)` でプリペアドステートメントを使用する

### エラーレスポンス形式
- 成功: `{ products: [...] }` / `{ product: {...} }` / `{ order: {...} }`
- エラー: `{ error: "メッセージ", details?: ["..."] }`
- スタックトレースはレスポンスに含めず `console.error()` のみ

### バリデーション
- メールアドレス: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` の簡易正規表現
- IDバリデーション: `Number.isInteger(id) && id > 0`
- エラー詳細は `details` 配列に格納して400を返す

## フロントエンドパターン

### SSR/CSR分離
- Server Component: 商品一覧・商品詳細（data fetch in async component）
- Client Component: カート・注文フォーム・注文完了（`'use client'`を先頭に記載）
- AddToCartButton は商品詳細ページから切り出した Client Component

### localStorageのSSR対策
- `useCart` フックで `initialized` フラグを使用
- `useEffect` 内でのみ localStorage にアクセスする
- `initialized === false` の間はローディング表示（ハイドレーション不一致防止）

### useSearchParams の Suspense 要件
- Next.js 14 では `useSearchParams()` を使うコンポーネントを必ず `<Suspense>` でラップする
- 注文完了画面: `OrderCompleteContent` を `Suspense` でラップして export

### カート空時のリダイレクト
- 注文フォーム画面: `useEffect` で `items.length === 0 && initialized` の時に `router.replace('/cart')` でリダイレクト

## Why: 注文番号のINSERT戦略
order_number は NOT NULL UNIQUE だが、INSERTは仮値 '' で実行し、
lastInsertId取得後にUPDATEする。並行リクエストでの '' 重複はトランザクション内で
INSERT直後にUPDATEすることで一意性を確保している。
