---
name: project-architecture
description: オンライン書店の3層アーキテクチャ（Next.js 14/Express/MySQL 8）と実装済みファイル構成
metadata:
  type: project
---

## 実装済みファイル一覧（2026-05-12）

### MySQL
- `mysql/init/01_init.sql` — products/orders/order_items テーブル定義 + サンプル5件

### バックエンド（Express + TypeScript）
- `backend/src/index.ts` — エントリポイント（CORS: localhost:3000のみ許可）
- `backend/src/db/pool.ts` — mysql2 接続プール（connectionLimit: 10）
- `backend/src/types/index.ts` — ProductRow/OrderRow/OrderItemRow 等の型定義
- `backend/src/db/productsQuery.ts` — getAllProducts/getProductById/getProductsByIds
- `backend/src/db/ordersQuery.ts` — createOrderWithItems（トランザクション）/getOrderById/getOrderItemsByOrderId
- `backend/src/controllers/productsController.ts` — GET /api/products, GET /api/products/:id
- `backend/src/controllers/ordersController.ts` — POST /api/orders, GET /api/orders/:id
- `backend/src/routes/products.ts` — productsRouter
- `backend/src/routes/orders.ts` — ordersRouter

### フロントエンド（Next.js 14 App Router）
- `frontend/src/types/index.ts` — Product/Order/CartItem/FormErrors 等の型定義
- `frontend/src/lib/api.ts` — fetchProducts/fetchProduct/createOrder
- `frontend/src/hooks/useCart.ts` — localStorage操作カスタムフック
- `frontend/src/components/Header.tsx` — Client Component（カートバッジ付き）
- `frontend/src/components/BookCard.tsx` — Server Component（商品カード）
- `frontend/src/components/AddToCartButton.tsx` — Client Component（カート追加ボタン）
- `frontend/src/components/CartItemRow.tsx` — Client Component（カート行）
- `frontend/src/components/OrderSummary.tsx` — Server Component（注文内容確認）
- `frontend/src/components/ErrorMessage.tsx` — Server Component（エラー表示）
- `frontend/src/app/layout.tsx` — ルートレイアウト（Header組み込み）
- `frontend/src/app/page.tsx` — SCR-01 商品一覧（Server Component）
- `frontend/src/app/products/[id]/page.tsx` — SCR-02 商品詳細（Server Component）
- `frontend/src/app/cart/page.tsx` — SCR-03 カート（Client Component）
- `frontend/src/app/order/page.tsx` — SCR-04 注文フォーム（Client Component）
- `frontend/src/app/order/complete/page.tsx` — SCR-05 注文完了（Client Component + Suspense）

## 重要な設計決定

- カートはlocalStorageで管理（DB永続化なし）
- 注文番号フォーマット: `ORD-` + 10桁ゼロ埋めID（例: ORD-0000000001）
- 価格は全て税込み（税計算不要）
- `@/` エイリアスは tsconfig.json に既設定済み
