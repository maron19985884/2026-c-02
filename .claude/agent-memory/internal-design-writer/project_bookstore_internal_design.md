# プロジェクトメモリ: オンライン書店 内部設計書

- **作成日**: 2026-05-10
- **エージェント**: internal-design-writer
- **対象プロジェクト**: /home/suga/workspace/docker/2026-c-02

---

## 内部設計書作成完了

以下の5機能すべての内部設計書を `docs/internal-design/` に作成しました。

| 機能ID | ファイル | ステータス |
|---|---|---|
| F-01 | `docs/internal-design/F-01-product-list.md` | 作成完了 |
| F-02 | `docs/internal-design/F-02-product-detail.md` | 作成完了 |
| F-03 | `docs/internal-design/F-03-cart.md` | 作成完了 |
| F-04 | `docs/internal-design/F-04-order-form.md` | 作成完了 |
| F-05 | `docs/internal-design/F-05-order-complete.md` | 作成完了 |
| (INDEX) | `docs/internal-design/README.md` | 作成完了 |

---

## 主要な設計上の発見

### 1. Amazonスタイルカラーパレット（外部設計書との乖離）

外部設計書はネイビー系（`#1e3a8a`）を指定しているが、実装ではAmazon本家のカラーパレット（`AMZ`定数）を使用している。ページ背景は `#EAEDED`（外部設計書は `#f3f4f6`）。

### 2. CartItem 型に image_url が含まれていない

`CartItem` 型（`src/types/index.ts`）には `image_url` がないため、カート画面（F-03）で書影を表示できない。絵文字プレースホルダー（📚）で代替。

### 3. APIレスポンスのステータスコード確認が不十分

F-02 と F-04 で `res.ok` を確認せずに `res.json()` を呼んでいる。エラーレスポンス時に意図しない処理が実行される可能性がある。

### 4. Next.js 14 App Router での useSearchParams

F-05（注文完了）は `useSearchParams()` を使用するため、コンポーネントを分割して `<Suspense>` でラップする2段構成が必要。実装済み。

### 5. POST /orders の total_amount 計算

バックエンドサーバー側で `items[].price × quantity` を合計して `total_amount` を計算している。ただし `price` 自体はクライアントから受け取っているため、DB上の価格との整合性チェックは未実装（スコープ外として許容）。

### 6. トランザクション管理

`POST /orders` は `pool.getConnection()` → `beginTransaction()` → INSERT × 複数 → `commit()` のパターンを使用。`finally` ブロックで `conn.release()` を確実に実行している。

---

## 技術スタック詳細

- **フロントエンド**: Next.js 14, TypeScript, インラインスタイルのみ, `"use client"` 必須, パスエイリアス `@/*`
- **バックエンド**: Express.js, TypeScript commonjs, mysql2/promise, 全ルートを `index.ts` に集約
- **DB**: MySQL 8, utf8mb4, InnoDB, 書籍6冊の初期データ
- **状態管理**: CartContext + localStorage（サーバーサイドカートなし）
