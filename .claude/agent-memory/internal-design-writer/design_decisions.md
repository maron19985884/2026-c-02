---
name: design-decisions
description: 内部設計書で採用したアーキテクチャ判断・命名規則・実装パターン
metadata:
  type: project
---

# 設計判断メモ

## バックエンド分離方針
- `backend/src/routes/` にルーター定義 (products.ts, orders.ts)
- `backend/src/controllers/` にハンドラー関数
- `backend/src/db/` に pool 設定と SQL クエリ関数 (pool.ts, productsQuery.ts, ordersQuery.ts)
- `backend/src/types/` に TypeScript 型定義
- エラーレスポンス形式: `{ error: string, details?: string[] }`

## フロントエンドパターン
- Server Components をデフォルト、インタラクティブ部分のみ "use client"
- カスタムフック `useCart` で localStorage 操作をカプセル化（`frontend/src/hooks/useCart.ts`）
- API クライアント `src/lib/api.ts` にベース URL 管理を集約
- 型定義 `src/types/index.ts` に集中管理
- `@/` インポートエイリアス使用（tsconfig.json の paths 設定が必要）
- useSearchParams() は Suspense でラップ必須（Next.js 14 制約）

## CORS 設定
- `cors({ origin: 'http://localhost:3000', methods: ['GET','POST'] })` で localhost:3000 のみ許可

## 注文作成トランザクション
1. items の product_id 存在確認 (SELECT)
2. total_amount 計算 (price × quantity の合計)
3. orders INSERT (order_number は仮値 '')
4. order_number = `ORD-` + lastInsertId.toString().padStart(10, '0')
5. orders UPDATE (order_number セット)
6. order_items INSERT (title/price スナップショット)
全工程を mysql2 の connection.beginTransaction() でラップ
finally節で connection.release() を必ず呼ぶ

**Why:** 注文番号が AUTO_INCREMENT の ID に依存するため、INSERT 後に UPDATE が必要
**How to apply:** POST /api/orders の処理フロー設計に適用

## メールアドレスバリデーション
- 正規表現: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`（簡易RFC5322準拠）
- フルスペック正規表現はメンテナンスコストが高いため簡略化を許容

## localStorage のSSR対策
- useEffect 内でのみ read/write
- initialized フラグでハイドレーション不一致を防ぐ

## NEXT_PUBLIC_API_URL の値
- ブラウザから呼ぶため `http://localhost:4000` が正しい
- コンテナ内名前解決 (`http://backend:4000`) はCSRでは使えない
